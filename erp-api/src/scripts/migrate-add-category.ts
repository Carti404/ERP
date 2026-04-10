import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 15433,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'erp',
  });

  await ds.initialize();
  console.log('Connected to DB. Running migration...');

  await ds.query(`
    ALTER TABLE internal_messages
      ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'GENERAL';
  `);
  console.log('✅ column "category" added to internal_messages (or already existed).');

  await ds.destroy();
  console.log('Done.');
}

runMigration().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
