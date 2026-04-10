import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ProductionController } from './production.controller';
import { ProductionSyncService } from './production.service';
import { ProductionTask } from './entities/production-task.entity';
import { ProductionAssignment } from './entities/production-assignment.entity';
import { ProductionProcess } from './entities/production-process.entity';
import { ProductionProcessTracking } from './entities/production-process-tracking.entity';
import { ProductionWaste } from './entities/production-waste.entity';
import { ProductProcessTemplate } from './entities/product-process-template.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionTask,
      ProductionAssignment,
      ProductionProcess,
      ProductionProcessTracking,
      ProductionWaste,
      ProductProcessTemplate,
      User,
    ]),
    HttpModule,
    NotificationsModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionSyncService],
  exports: [ProductionSyncService],
})
export class ProductionModule {}
