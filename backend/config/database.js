import './env.js';
import { createSchemaStatements } from './schema.js';
import { URL } from 'url';

const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_CLIENT = 'mysql';
const selectedDatabaseEnv = process.env.DATABASE_URL ? 'DATABASE_URL' : 'missing';

let connection;
let dbInstance;

function normalizeResult(result) {
  if (Array.isArray(result)) {
    const [rows, metadata] = result;
    if (Array.isArray(rows)) {
      return {
        rows,
        lastID: metadata?.insertId ?? null,
        rowCount: metadata?.affectedRows ?? rows.length ?? 0,
      };
    }
    if (rows && typeof rows === 'object') {
      return {
        rows: [],
        lastID: rows.insertId ?? null,
        rowCount: rows.affectedRows ?? 0,
      };
    }
  }

  return {
    rows: result?.rows || [],
    lastID: result?.insertId ?? null,
    rowCount: result?.rowCount ?? result?.affectedRows ?? 0,
  };
}

function createAsyncDb({ query }) {
  const runQuery = async (sql, params = []) => normalizeResult(await query(sql, params));

  return {
    client: 'mysql',
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

function assertConnectionUrl() {
  if (!DATABASE_URL) {
    throw new Error('MySQL database requires DATABASE_URL.');
  }
  if (!DATABASE_URL.startsWith('mysql://') && !DATABASE_URL.startsWith('mysql2://') && !DATABASE_URL.startsWith('mariadb://')) {
    throw new Error('MySQL database URL must be a MySQL/MariaDB connection string.');
  }
}

async function createMysqlDb() {
  assertConnectionUrl();
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
    query: (sql, params) => connection.query(sql, params),
  });
}

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await createMysqlDb();
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
    hasSupportedUrl:
      DATABASE_URL.startsWith('mysql://')
      || DATABASE_URL.startsWith('mysql2://')
      || DATABASE_URL.startsWith('mariadb://'),
    sslEnabled: process.env.DB_SSL !== 'false',
  };
}

export default { getDb, initDatabase };
