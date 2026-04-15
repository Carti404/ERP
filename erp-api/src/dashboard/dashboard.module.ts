import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { ProductionTask } from '../production/entities/production-task.entity';
import { ProductionWaste } from '../production/entities/production-waste.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AttendanceRecord,
      ProductionTask,
      ProductionWaste,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
