import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { Holiday } from './system-parameters/entities/holiday.entity';
import { PlantRestSettings } from './system-parameters/entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from './system-parameters/entities/work-schedule-block.entity';
import { SystemParametersModule } from './system-parameters/system-parameters.module';
import { InternalMessage } from './messages/entities/internal-message.entity';
import { MessagesModule } from './messages/messages.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AttendanceLog } from './attendance/entities/attendance-log.entity';
import { AttendanceRecord } from './attendance/entities/attendance-record.entity';
import { AttendanceModule } from './attendance/attendance.module';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
          AttendanceRecord,
          AttendanceLog,
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
  ],
})
export class AppModule {}
