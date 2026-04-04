/**
 * Ensures PostgreSQL database DB_NAME exists (connects to maintenance DB "postgres").
 * Safe to run repeatedly. Used by npm premigrate / db:create.
 */
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

function assertSafeDbName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('DB_NAME is required');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores');
  }
}

async function main() {
  const dbName = (process.env.DB_NAME || 'subscription_management').trim();
  assertSafeDbName(dbName);

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD != null ? process.env.DB_PASSWORD : '',
    database: 'postgres',
  });

  await client.connect();

  const { rows } = await client.query('SELECT 1 AS x FROM pg_database WHERE datname = $1', [
    dbName,
  ]);

  if (rows.length === 0) {
    // dbName validated above — safe identifier
    await client.query(`CREATE DATABASE ${dbName}`);
    // eslint-disable-next-line no-console
    console.log(`[db:create] Created database "${dbName}".`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[db:create] Database "${dbName}" already exists.`);
  }

  await client.end();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[db:create] Failed:', err.message);
  process.exit(1);
});
