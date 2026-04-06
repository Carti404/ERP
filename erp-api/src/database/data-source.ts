import { DataSource } from 'typeorm';

import { Holiday } from '../system-parameters/entities/holiday.entity';
import { PlantRestSettings } from '../system-parameters/entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from '../system-parameters/entities/work-schedule-block.entity';
import { InternalMessage } from '../messages/entities/internal-message.entity';
import { User } from '../users/entities/user.entity';
import { dbConnectionEnv, loadErpEnvFile } from './load-erp-env';

loadErpEnvFile();
const db = dbConnectionEnv();

const common = {
  type: 'postgres' as const,
  entities: [
    User,
    WorkScheduleBlock,
    PlantRestSettings,
    Holiday,
    InternalMessage,
  ],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
};

export const AppDataSource = new DataSource(
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
