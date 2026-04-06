import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Holiday } from './entities/holiday.entity';
import { PlantRestSettings } from './entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from './entities/work-schedule-block.entity';
import { SystemParametersController } from './system-parameters.controller';
import { SystemParametersService } from './system-parameters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkScheduleBlock,
      PlantRestSettings,
      Holiday,
    ]),
  ],
  controllers: [SystemParametersController],
  providers: [SystemParametersService],
  exports: [SystemParametersService],
})
export class SystemParametersModule {}
