import './env.js';
import { createSchemaStatements } from './schema.js';
import { URL } from 'url';

const DATABASE_URL = process.env.DATABASE_URL || '';

function inferDatabaseClient() {
  const explicitClient = (process.env.DB_CLIENT || '').toLowerCase();
  if (explicitClient) return explicitClient;

  if (DATABASE_URL.startsWith('mysql://') || DATABASE_URL.startsWith('mysql2://') || DATABASE_URL.startsWith('mariadb://')) {
    return 'mysql';
  }

  if (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://')) {
    return 'postgres';
  }

  return 'postgres';
}

const DB_CLIENT = inferDatabaseClient();

const selectedDatabaseEnv = process.env.DATABASE_URL ? 'DATABASE_URL' : 'missing';

let connection;
let dbInstance;
let connectionType = DB_CLIENT;

function normalizeResult(result) {
  if (Array.isArray(result)) {
    const [rowsOrResult, metadata] = result;
    if (Array.isArray(rowsOrResult)) {
      return {
        rows: rowsOrResult,
        lastID: metadata?.insertId ?? null,
        rowCount: metadata?.affectedRows ?? rowsOrResult.length ?? 0,
      };
    }

    if (rowsOrResult && typeof rowsOrResult === 'object') {
      return {
        rows: [],
        lastID: rowsOrResult.insertId ?? null,
        rowCount: rowsOrResult.affectedRows ?? 0,
      };
    }
  }

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
  if (client === 'mysql' && !DATABASE_URL.startsWith('mysql://') && !DATABASE_URL.startsWith('mysql2://') && !DATABASE_URL.startsWith('mariadb://')) {
    throw new Error(`${client} database URL must be a MySQL/MariaDB connection string.`);
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

async function createMysqlDb() {
  assertConnectionUrl('mysql');
  const mysqlModule = await import('mysql2/promise');
  const mysql = mysqlModule.default ?? mysqlModule;
  const parsedUrl = new URL(DATABASE_URL.replace(/^mysql2:\/\//, 'mysql://').replace(/^mariadb:\/\//, 'mysql://'));
  connection = mysql.createPool({
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
    user: decodeURIComponent(parsedUrl.username || ''),
    password: decodeURIComponent(parsedUrl.password || ''),
    database: parsedUrl.pathname.replace(/^\/+/, ''),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  return createAsyncDb({
    client: 'mysql',
    query: (sql, params) => connection.query(sql, params),
  });
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  if (DB_CLIENT === 'postgres' || DB_CLIENT === 'postgresql') {
    connectionType = 'postgres';
    dbInstance = await createPostgresDb();
  } else if (DB_CLIENT === 'mysql' || DB_CLIENT === 'mysql2' || DB_CLIENT === 'mariadb') {
    connectionType = 'mysql';
    dbInstance = await createMysqlDb();
  } else {
    throw new Error(`Unsupported DB_CLIENT "${DB_CLIENT}". Use "postgres" or "mysql".`);
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
    connectionType,
    selectedEnv: selectedDatabaseEnv,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasSupportedUrl:
      DATABASE_URL.startsWith('postgres://')
      || DATABASE_URL.startsWith('postgresql://')
      || DATABASE_URL.startsWith('mysql://')
      || DATABASE_URL.startsWith('mysql2://')
      || DATABASE_URL.startsWith('mariadb://'),
    sslEnabled: process.env.DB_SSL !== 'false',
  };
}

export default { getDb, initDatabase };
