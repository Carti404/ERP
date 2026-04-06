/**
 * Crea el primer administrador si la tabla está vacía.
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts
 *
 * Variables: SEED_ADMIN_USERNAME (default admin), SEED_ADMIN_PIN (default 0000),
 * SEED_ADMIN_NAME (default Administrador)
 */
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { UserRole } from '../common/enums/user-role.enum';
import { dbConnectionEnv, loadErpEnvFile } from '../database/load-erp-env';
import { User } from '../users/entities/user.entity';

loadErpEnvFile();
const db = dbConnectionEnv();

async function main() {
  const common = {
    type: 'postgres' as const,
    entities: [User],
    synchronize: false,
  };
  const ds = new DataSource(
    db.useUrl
      ? { ...common, url: db.url }
      : {
          ...common,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
        },
  );
  await ds.initialize();
  const count = await ds.getRepository(User).count();
  if (count > 0) {
    console.log('Ya existen usuarios; no se crea seed.');
    await ds.destroy();
    return;
  }
  const username = (process.env.SEED_ADMIN_USERNAME ?? 'admin')
    .toLowerCase()
    .trim();
  const pin = process.env.SEED_ADMIN_PIN ?? '0000';
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Administrador';
  const pinHash = await bcrypt.hash(pin, 10);
  await ds.getRepository(User).save({
    username,
    email: null,
    pinHash,
    role: UserRole.ADMIN,
    fullName,
    puesto: null,
    activo: true,
  });

  console.log(
    `Administrador creado: usuario="${username}" PIN=${pin} (cámbialo en producción).`,
  );
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
