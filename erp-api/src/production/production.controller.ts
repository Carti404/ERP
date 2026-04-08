import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductionSyncService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionSyncService) {}

  @Get()
  async getProductionTasks() {
    return this.productionService.findAll();
  }

  @Get(':id')
  async getProductionTask(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }
}
