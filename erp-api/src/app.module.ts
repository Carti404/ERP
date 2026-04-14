import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { Holiday } from './system-parameters/entities/holiday.entity';
import { PlantRestSettings } from './system-parameters/entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from './system-parameters/entities/work-schedule-block.entity';
import { SystemParametersModule } from './system-parameters/system-parameters.module';
import { InternalMessage } from './messages/entities/internal-message.entity';
import { InternalMessageAttachment } from './messages/entities/internal-message-attachment.entity';
import { LeaveRequest } from './messages/entities/leave-request.entity';
import { LeaveRequestHistory } from './messages/entities/leave-request-history.entity';
import { MessagesModule } from './messages/messages.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AttendanceLog } from './attendance/entities/attendance-log.entity';
import { AttendanceRecord } from './attendance/entities/attendance-record.entity';
import { AttendanceModule } from './attendance/attendance.module';
import { ProductionModule } from './production/production.module';
import { ProductionTask } from './production/entities/production-task.entity';
import { ProductionAssignment } from './production/entities/production-assignment.entity';
import { ProductionProcess } from './production/entities/production-process.entity';
import { ProductionProcessTracking } from './production/entities/production-process-tracking.entity';
import { ProductionWaste } from './production/entities/production-waste.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { AppNotification } from './notifications/entities/notification.entity';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'erp'),
        entities: [
          User,
          WorkScheduleBlock,
          PlantRestSettings,
          Holiday,
          InternalMessage,
          InternalMessageAttachment,
          LeaveRequest,
          LeaveRequestHistory,
          AttendanceRecord,
          AttendanceLog,
          ProductionTask,
          ProductionAssignment,
          ProductionProcess,
          ProductionProcessTracking,
          ProductionWaste,
          AppNotification,
        ],

        synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    SystemParametersModule,
    AuthModule,
    MessagesModule,
    AttendanceModule,
    HealthModule,
    ProductionModule,
    NotificationsModule,
    CloudinaryModule,
    ScheduleModule.forRoot(),
  ],

})
export class AppModule {}
