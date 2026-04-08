import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { ProductionController } from './production.controller';
import { ProductionSyncService } from './production.service';
import { ProductionTask } from './entities/production-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionTask]),
    HttpModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionSyncService],
  exports: [ProductionSyncService],
})
export class ProductionModule {}
