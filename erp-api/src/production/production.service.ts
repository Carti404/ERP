import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ProductionTask } from './entities/production-task.entity';

@Injectable()
export class ProductionSyncService {
  private readonly logger = new Logger(ProductionSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(ProductionTask)
    private readonly taskRepo: Repository<ProductionTask>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE) // Para propósitos de este MVP, corre cada minuto
  async syncPendingOrders() {
    this.logger.log('Sincronizando órdenes de producción desde Mundo Terapeuta...');
    try {
      // Nota: Asumiendo que Mundo Terapeuta corre en puerto 3000 y el ERP en 3001
      const defaultMtUrl = 'http://localhost:3000/api/erp/production-orders/pending';
      const mtUrl = process.env.MT_API_URL ? `${process.env.MT_API_URL}/api/erp/production-orders/pending` : defaultMtUrl;
      
      const response = await firstValueFrom(
        this.httpService.get(mtUrl)
      );

      const orders = response.data;
      let newCount = 0;

      for (const order of orders) {
        // Verificar si la orden ya existe en ERP
        const existing = await this.taskRepo.findOne({ where: { externalMtId: order.id } });
        if (!existing) {
          // Crear nueva orden
          const task = this.taskRepo.create({
            externalMtId: order.id,
            orderNumber: order.orderNumber,
            productId: order.productId,
            productName: order.product?.name || 'Desconocido',
            quantityToProduce: order.quantityToProduce,
            recipe: order.recipe,
            status: 'DRAFT', // Pendiente de asignación en el ERP
          });
          await this.taskRepo.save(task);
          newCount++;
        }
      }

      this.logger.log(`Sincronización completada. ${newCount} nuevas órdenes importadas.`);
    } catch (error) {
      this.logger.error('Error sincronizando órdenes desde MT', error.message);
    }
  }

  async findAll() {
    return this.taskRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.taskRepo.findOne({ where: { id } });
  }
}
