import dotenv from 'dotenv';
import { createSchemaStatements } from './schema.js';

dotenv.config();

const DB_CLIENT = (process.env.DB_CLIENT || 'mysql').toLowerCase();
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || '';

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
    throw new Error(`${client} database requires DATABASE_URL or MYSQL_URL. Railway should use the MySQL service connection URL.`);
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
    throw new Error(`Unsupported DB_CLIENT "${DB_CLIENT}". This app only supports Docker MySQL.`);
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

export default { getDb, initDatabase };
