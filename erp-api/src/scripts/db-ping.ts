/**
 * Prueba conexión con la misma config que migraciones/seed (sin TypeORM).
 * Uso: npm run db:ping
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- script de diagnóstico con pg */
import { Client } from 'pg';

import { dbConnectionEnv, loadErpEnvFile } from '../database/load-erp-env';

loadErpEnvFile();
const db = dbConnectionEnv();

function destinoParaLog(): string {
  if (db.useUrl) {
    return db.url.replace(/:([^:@/]+)@/, ':***@');
  }
  return `${db.username}@${db.host}:${db.port}/${db.database}`;
}

async function main() {
  console.log('Intentando:', destinoParaLog());

  const client = db.useUrl
    ? new Client({ connectionString: db.url })
    : new Client({
        host: db.host,
        port: db.port,
        user: db.username,
        password: db.password,
        database: db.database,
      });

  try {
    await client.connect();
    const r = await client.query('SELECT current_user, current_database()');

    console.log('OK:', r.rows[0]);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Fallo conexión:', msg);
  process.exit(1);
});
