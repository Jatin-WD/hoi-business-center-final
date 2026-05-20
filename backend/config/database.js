import dotenv from 'dotenv';
import { createSchemaStatements } from './schema.js';

dotenv.config();

const DB_CLIENT = (process.env.DB_CLIENT || 'postgres').toLowerCase();

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL || '';
}

const DATABASE_URL = resolveDatabaseUrl();
const selectedDatabaseEnv = process.env.DATABASE_URL ? 'DATABASE_URL' : 'missing';

let connection;
let dbInstance;

function normalizeResult(result) {
  const resultHeader = Array.isArray(result) && !Array.isArray(result[0]) ? result[0] : null;
  return {
    rows: result?.rows || result?.[0] || [],
    lastID: result?.insertId || resultHeader?.insertId || result?.rows?.[0]?.id || null,
    rowCount: result?.rowCount || result?.affectedRows || resultHeader?.affectedRows || 0,
  };
}

function toPostgresSql(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function createAsyncDb({ client, query }) {
  const runQuery = async (sql, params = []) => {
    return normalizeResult(await query(client === 'postgres' ? toPostgresSql(sql) : sql, params));
  };

  return {
    client,
    async exec(sql) {
      const statements = sql.split(';').map((item) => item.trim()).filter(Boolean);
      for (const statement of statements) await runQuery(statement);
    },
    async get(sql, params = []) {
      return (await runQuery(sql, params)).rows[0] || null;
    },
    async all(sql, params = []) {
      return (await runQuery(sql, params)).rows;
    },
    async run(sql, params = []) {
      const result = await runQuery(sql, params);
      return { lastID: result.lastID, rowCount: result.rowCount };
    },
    prepare(sql) {
      return {
        get: (...params) => this.get(sql, params.flat()),
        all: (...params) => this.all(sql, params.flat()),
        run: (...params) => this.run(sql, params.flat()),
      };
    },
    async close() {
      if (connection?.end) await connection.end();
      connection = null;
      dbInstance = null;
    },
  };
}

function assertConnectionUrl(client) {
  if (!DATABASE_URL) {
    throw new Error(`${client} database requires DATABASE_URL.`);
  }
  if (client === 'postgres' && !DATABASE_URL.startsWith('postgres://') && !DATABASE_URL.startsWith('postgresql://')) {
    throw new Error(`${client} database URL must be a PostgreSQL/Supabase connection string.`);
  }
}

async function createPostgresDb() {
  assertConnectionUrl('postgres');
  const { Pool } = await import('pg');
  connection = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  return createAsyncDb({
    client: 'postgres',
    query: (sql, params) => connection.query(sql, params),
  });
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  if (DB_CLIENT === 'postgres' || DB_CLIENT === 'postgresql') {
    dbInstance = await createPostgresDb();
  } else {
    throw new Error(`Unsupported DB_CLIENT "${DB_CLIENT}". Use "postgres".`);
  }

  return dbInstance;
}

export async function initDatabase() {
  const db = await getDb();
  for (const statement of createSchemaStatements(db.client)) await db.exec(statement);
  try {
    await db.get('SELECT status FROM users LIMIT 1');
  } catch {
    await db.exec("ALTER TABLE users ADD COLUMN status varchar(40) default 'active'");
  }
  return db;
}

export function getDatabaseConfigStatus() {
  return {
    client: DB_CLIENT,
    selectedEnv: selectedDatabaseEnv,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    isPostgresUrl: DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'),
  };
}

export default { getDb, initDatabase };
