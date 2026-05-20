import dotenv from 'dotenv';
import { createSchemaStatements } from './schema.js';

dotenv.config();

const DB_CLIENT = (process.env.DB_CLIENT || 'mysql').toLowerCase();

function buildMysqlUrlFromParts() {
  const host = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || process.env.DATABASE_HOST;
  const port = process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || process.env.DATABASE_PORT || '3306';
  const user = process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || process.env.DATABASE_USER;
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;
  const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.DATABASE_NAME;

  if (!host || !user || !password || !database) return '';
  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function resolveDatabaseUrl() {
  return process.env.MYSQL_URL || process.env.DATABASE_URL || buildMysqlUrlFromParts();
}

const DATABASE_URL = resolveDatabaseUrl();
const selectedDatabaseEnv = process.env.MYSQL_URL
  ? 'MYSQL_URL'
  : process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : DATABASE_URL
      ? 'MYSQL_PARTS'
      : 'missing';

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

function createAsyncDb({ client, query }) {
  const runQuery = async (sql, params = []) => {
    return normalizeResult(await query(sql, params));
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
    throw new Error(`${client} database requires DATABASE_URL or MYSQL_URL.`);
  }
  if (client === 'mysql' && !DATABASE_URL.startsWith('mysql://') && !DATABASE_URL.startsWith('mysql2://')) {
    throw new Error(`${client} database URL must be a MySQL connection string.`);
  }
}

async function createMysqlDb() {
  assertConnectionUrl('mysql');
  const mysql = await import('mysql2/promise');
  connection = mysql.createPool(DATABASE_URL);
  return createAsyncDb({
    client: 'mysql',
    query: (sql, params) => connection.execute(sql, params),
  });
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  if (DB_CLIENT === 'mysql') {
    dbInstance = await createMysqlDb();
  } else {
    throw new Error(`Unsupported DB_CLIENT "${DB_CLIENT}". Use "mysql".`);
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
    hasMysqlUrl: Boolean(process.env.MYSQL_URL),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasMysqlParts: Boolean(
      (process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || process.env.DATABASE_HOST)
      && (process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || process.env.DATABASE_USER)
      && (process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD)
      && (process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.DATABASE_NAME)
    ),
    isMysqlUrl: DATABASE_URL.startsWith('mysql://') || DATABASE_URL.startsWith('mysql2://'),
  };
}

export default { getDb, initDatabase };
