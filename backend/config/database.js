import './env.js';
import { TABLES, createSchemaStatements } from './schema.js';
import { PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../data/seed-data.js';
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
      const statements = splitSqlStatements(sql);
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

function escapeIdentifier(name) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

function normalizeColumnType(type) {
  return String(type).replace(/\s+unique\b/gi, '').trim();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function normalizeKeyPart(value) {
  return String(value ?? '').trim().toLowerCase();
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += char;
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (inSingle) {
      current += char;
      if (char === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      if (char === '\'' && !escaped) inSingle = false;
      escaped = false;
      continue;
    }

    if (inDouble) {
      current += char;
      if (char === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      if (char === '"' && !escaped) inDouble = false;
      escaped = false;
      continue;
    }

    if (inBacktick) {
      current += char;
      if (char === '`') inBacktick = false;
      continue;
    }

    if (char === '-' && next === '-') {
      current += char + next;
      i += 1;
      inLineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      current += char + next;
      i += 1;
      inBlockComment = true;
      continue;
    }

    if (char === '\'') {
      current += char;
      inSingle = true;
      escaped = false;
      continue;
    }

    if (char === '"') {
      current += char;
      inDouble = true;
      escaped = false;
      continue;
    }

    if (char === '`') {
      current += char;
      inBacktick = true;
      continue;
    }

    if (char === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function getExistingColumns(db, tableName) {
  const columns = await db.all(`SHOW COLUMNS FROM ${escapeIdentifier(tableName)}`);
  return new Map(columns.map((column) => [String(column.Field).toLowerCase(), column]));
}

async function getExistingIndexes(db, tableName) {
  const indexes = await db.all(`SHOW INDEX FROM ${escapeIdentifier(tableName)}`);
  const grouped = new Map();
  for (const index of indexes) {
    const name = String(index.Key_name);
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push({
      column: String(index.Column_name),
      nonUnique: Number(index.Non_unique),
      seq: Number(index.Seq_in_index),
    });
  }
  return grouped;
}

function hasMatchingUniqueIndex(indexes, columns) {
  const target = columns.map((column) => String(column).toLowerCase());
  for (const entries of indexes.values()) {
    if (!entries.length) continue;
    if (Number(entries[0].nonUnique) !== 0) continue;
    const ordered = [...entries].sort((a, b) => a.seq - b.seq).map((entry) => String(entry.column).toLowerCase());
    if (ordered.length === target.length && ordered.every((column, index) => column === target[index])) {
      return true;
    }
  }
  return false;
}

async function synchronizeMysqlSchema(db) {
  for (const table of TABLES) {
    const existingColumns = await getExistingColumns(db, table.name).catch(() => null);
    if (!existingColumns) continue;

    for (const [columnName, columnType] of table.columns) {
      if (existingColumns.has(columnName.toLowerCase())) continue;
      const definition = normalizeColumnType(columnType);
      await db.exec(`ALTER TABLE ${escapeIdentifier(table.name)} ADD COLUMN ${escapeIdentifier(columnName)} ${definition}`);
    }

  }
}

async function repairServiceIdentifiers(db) {
  try {
    const rows = await db.all('SELECT id, label, service_id FROM services');
    if (!rows.length) return;

    const labelToId = new Map(
      Object.entries(SERVICE_PACKAGES).map(([serviceId, service]) => [String(service.label || '').toLowerCase(), serviceId])
    );

    for (const row of rows) {
      if (row.service_id) continue;
      const mappedId = labelToId.get(String(row.label || '').toLowerCase()) || slugify(row.label) || `service-${row.id}`;
      await db.run(
        'UPDATE services SET service_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [mappedId, row.id]
      );
    }
  } catch (error) {
    console.error('Service identifier repair failed:', error);
  }
}

async function repairVenueIdentifiers(db) {
  try {
    const rows = await db.all('SELECT id, location_id, sub_venue_id, name, address, city, state FROM venues');
    if (!rows.length) return;

    const canonicalById = new Map(
      VENUE_DETAILS.map((venue) => [
        `${normalizeKeyPart(venue.locationId)}|${normalizeKeyPart(venue.subVenueId)}`,
        venue,
      ])
    );
    const canonicalByIdentity = new Map(
      VENUE_DETAILS.map((venue) => [
        `${normalizeKeyPart(venue.name)}|${normalizeKeyPart(venue.address)}|${normalizeKeyPart(venue.city)}|${normalizeKeyPart(venue.state)}`,
        venue,
      ])
    );

    for (const row of rows) {
      const byId = canonicalById.get(`${normalizeKeyPart(row.location_id)}|${normalizeKeyPart(row.sub_venue_id)}`);
      const byIdentity = canonicalByIdentity.get(`${normalizeKeyPart(row.name)}|${normalizeKeyPart(row.address)}|${normalizeKeyPart(row.city)}|${normalizeKeyPart(row.state)}`);
      const canonical = byId || byIdentity;
      if (!canonical) continue;

      if (isBlank(row.location_id) || isBlank(row.sub_venue_id)) {
        await db.run(
          'UPDATE venues SET location_id = ?, sub_venue_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [canonical.locationId, canonical.subVenueId, row.id]
        );
      }
    }
  } catch (error) {
    console.error('Venue identifier repair failed:', error);
  }
}

async function repairPackageIdentifiers(db) {
  try {
    const rows = await db.all('SELECT id, category, subcategory, title, subtitle FROM packages');
    if (!rows.length) return;

    const canonicalByIdentity = new Map();
    for (const [category, subcategories] of Object.entries(PACKAGE_DETAILS)) {
      for (const [subcategory, pkg] of Object.entries(subcategories)) {
        canonicalByIdentity.set(
          `${normalizeKeyPart(category)}|${normalizeKeyPart(subcategory)}|${normalizeKeyPart(pkg.title)}|${normalizeKeyPart(pkg.subtitle)}`,
          { category, subcategory }
        );
      }
    }

    for (const row of rows) {
      const canonical = canonicalByIdentity.get(
        `${normalizeKeyPart(row.category)}|${normalizeKeyPart(row.subcategory)}|${normalizeKeyPart(row.title)}|${normalizeKeyPart(row.subtitle)}`
      );
      if (!canonical) continue;
      if (isBlank(row.category) || isBlank(row.subcategory)) {
        await db.run(
          'UPDATE packages SET category = ?, subcategory = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [canonical.category, canonical.subcategory, row.id]
        );
      }
    }
  } catch (error) {
    console.error('Package identifier repair failed:', error);
  }
}

async function dedupeUniqueRows(db) {
  if (process.env.ALLOW_DB_DEDUPLICATION !== 'true') return;

  for (const table of TABLES) {
    for (const uniqueKey of table.uniqueKeys || []) {
      try {
        const rows = await db.all(`SELECT id, ${uniqueKey.columns.join(', ')} FROM ${escapeIdentifier(table.name)} ORDER BY id ASC`);
        const groups = new Map();
        for (const row of rows) {
          const key = uniqueKey.columns.map((column) => normalizeKeyPart(row[column])).join('|');
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(row);
        }

        for (const group of groups.values()) {
          if (group.length < 2) continue;
          const [keeper, ...duplicates] = group;
          for (const duplicate of duplicates) {
            await db.run(`DELETE FROM ${escapeIdentifier(table.name)} WHERE id = ?`, [duplicate.id]);
          }
          void keeper;
        }
      } catch (error) {
        console.error(`Deduplication failed for ${table.name}.${uniqueKey.name}:`, error);
      }
    }
  }
}

async function ensureUniqueIndexes(db) {
  for (const table of TABLES) {
    const existingIndexes = await getExistingIndexes(db, table.name).catch(() => new Map());
    for (const uniqueKey of table.uniqueKeys || []) {
      if (hasMatchingUniqueIndex(existingIndexes, uniqueKey.columns)) continue;
      try {
        const keyColumns = uniqueKey.columns.map((column) => escapeIdentifier(column)).join(', ');
        await db.exec(`ALTER TABLE ${escapeIdentifier(table.name)} ADD UNIQUE KEY ${escapeIdentifier(uniqueKey.name)} (${keyColumns})`);
      } catch (error) {
        console.error(`Failed to ensure unique index ${table.name}.${uniqueKey.name}:`, error);
      }
    }
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
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' },
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
  await synchronizeMysqlSchema(db);
  await repairServiceIdentifiers(db);
  await repairVenueIdentifiers(db);
  await repairPackageIdentifiers(db);
  await ensureUniqueIndexes(db);
  await dedupeUniqueRows(db);
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
