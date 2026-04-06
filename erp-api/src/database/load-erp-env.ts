import { config as loadEnv } from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * `node-pg` usa variables PG* si el valor en el config es “falsy” (p. ej. contraseña vacía).
 * En Windows suele quedar PGPASSWORD/PGUSER de una instalación anterior y rompe aunque
 * `DATABASE_URL` sea correcta.
 */
function stripLibpqEnvOverrides(): void {
  for (const key of [
    'PGPASSWORD',
    'PGUSER',
    'PGHOST',
    'PGPORT',
    'PGDATABASE',
    'PGHOSTADDR',
  ]) {
    delete process.env[key];
  }
}

/**
 * Carga solo `erp-api/.env` (ruta fija respecto a este archivo).
 * `override: true` para que el archivo pise variables ya definidas en el sistema.
 */
export function loadErpEnvFile(): void {
  const atRepo = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(atRepo)) {
    loadEnv({ path: atRepo, override: true });
  }
  stripLibpqEnvOverrides();
}

function strEnv(key: string, fallback: string): string {
  const v = process.env[key];
  if (v === undefined || v === null) {
    return fallback;
  }
  const t = String(v).trim();
  return t.length > 0 ? t : fallback;
}

function sanitizeDatabaseUrl(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/\r/g, '')
    .replace(/\n/g, '');
}

export type DbConn =
  | { useUrl: true; url: string }
  | {
      useUrl: false;
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };

/**
 * Si existe `DATABASE_URL`, se usa sola (útil si las variables sueltas fallan).
 * Ej.: postgresql://postgres:postgres@127.0.0.1:5433/erp
 */
export function dbConnectionEnv(): DbConn {
  const urlRaw = process.env.DATABASE_URL;
  const urlClean = urlRaw ? sanitizeDatabaseUrl(urlRaw) : '';
  if (urlClean.length > 0) {
    return { useUrl: true, url: urlClean };
  }
  const portRaw = parseInt(String(process.env.DB_PORT ?? '5432'), 10);
  return {
    useUrl: false,
    host: strEnv('DB_HOST', 'localhost'),
    port: Number.isFinite(portRaw) ? portRaw : 5432,
    username: strEnv('DB_USER', 'postgres'),
    password: strEnv('DB_PASSWORD', 'postgres'),
    database: strEnv('DB_NAME', 'erp'),
  };
}
