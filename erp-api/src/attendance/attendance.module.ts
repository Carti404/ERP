import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceLog } from './entities/attendance-log.entity';
import { UsersModule } from '../users/users.module';
import { SystemParametersModule } from '../system-parameters/system-parameters.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, AttendanceLog]),
    UsersModule,
    SystemParametersModule,
    NotificationsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
