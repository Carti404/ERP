import { DataSource } from 'typeorm';

import { Holiday } from '../system-parameters/entities/holiday.entity';
import { PlantRestSettings } from '../system-parameters/entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from '../system-parameters/entities/work-schedule-block.entity';
import { InternalMessage } from '../messages/entities/internal-message.entity';
import { User } from '../users/entities/user.entity';
import { AttendanceLog } from '../attendance/entities/attendance-log.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { ProductionTask } from '../production/entities/production-task.entity';
import { ProductionAssignment } from '../production/entities/production-assignment.entity';
import { ProductionProcess } from '../production/entities/production-process.entity';
import { ProductionProcessTracking } from '../production/entities/production-process-tracking.entity';
import { ProductionWaste } from '../production/entities/production-waste.entity';
import { ProductProcessTemplate } from '../production/entities/product-process-template.entity';
import { AppNotification } from '../notifications/entities/notification.entity';
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
    AttendanceLog,
    AttendanceRecord,
    ProductionTask,
    ProductionAssignment,
    ProductionProcess,
    ProductionProcessTracking,
    ProductionWaste,
    ProductProcessTemplate,
    AppNotification,
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
