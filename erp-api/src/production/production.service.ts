import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ProductionTask } from './entities/production-task.entity';
import { ProductionAssignment } from './entities/production-assignment.entity';
import { ProductionProcess } from './entities/production-process.entity';
import { ProductionProcessTracking } from './entities/production-process-tracking.entity';
import { ProductionWaste } from './entities/production-waste.entity';
import { ProductProcessTemplate } from './entities/product-process-template.entity';
import { ProductionAssignmentStatus } from '../common/enums/production-assignment-status.enum';
import { CreateAssignmentsDto } from './dto/create-assignments.dto';
import { SetProcessesDto } from './dto/set-processes.dto';
import { ReportWasteDto } from './dto/report-waste.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ProductionSyncService {
  private readonly logger = new Logger(ProductionSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(ProductionTask)
    private readonly taskRepo: Repository<ProductionTask>,
    @InjectRepository(ProductionAssignment)
    private readonly assignmentRepo: Repository<ProductionAssignment>,
    @InjectRepository(ProductionProcess)
    private readonly processRepo: Repository<ProductionProcess>,
    @InjectRepository(ProductionProcessTracking)
    private readonly trackingRepo: Repository<ProductionProcessTracking>,
    @InjectRepository(ProductionWaste)
    private readonly wasteRepo: Repository<ProductionWaste>,
    @InjectRepository(ProductProcessTemplate)
    private readonly templateRepo: Repository<ProductProcessTemplate>,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ──────────────────────────────────────────────
  //  SINCRONIZACIÓN CON MUNDO TERAPEUTA
  // ──────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async syncPendingOrders() {
    this.logger.log('Sincronizando órdenes de producción desde Mundo Terapeuta...');
    try {
      const defaultMtUrl = 'http://localhost:3000/api/erp/production-orders/pending';
      const mtUrl = process.env.MT_API_URL ? `${process.env.MT_API_URL}/api/erp/production-orders/pending` : defaultMtUrl;
      
      const response = await firstValueFrom(
        this.httpService.get(mtUrl)
      );

      const orders = response.data;
      let newCount = 0;
      const ordersWithoutProcesses: string[] = [];

      for (const order of orders) {
        const existing = await this.taskRepo.findOne({ where: { externalMtId: order.id } });
        if (!existing) {
          const task = this.taskRepo.create({
            externalMtId: order.id,
            orderNumber: order.orderNumber,
            productId: order.productId,
            productName: order.product?.name || 'Desconocido',
            quantityToProduce: order.quantityToProduce,
            recipe: order.recipe,
            status: 'DRAFT',
          });
          const savedTask = await this.taskRepo.save(task);
          newCount++;

          // ── Verificar si existe una plantilla de procesos para este producto ──
          const templates = await this.templateRepo.find({
            where: { productId: order.productId },
            order: { orderIndex: 'ASC' },
          });

          if (templates.length > 0) {
            // Crear procesos automáticamente a partir de la plantilla
            const autoProcesses = templates.map(t =>
              this.processRepo.create({
                taskId: savedTask.id,
                orderIndex: t.orderIndex,
                name: t.name,
                description: t.description || '',
                estimatedTimeValue: t.estimatedTimeValue,
                estimatedTimeUnit: t.estimatedTimeUnit || 'minutes',
              }),
            );
            await this.processRepo.save(autoProcesses);

            // Copiar el tiempo total estimado de la plantilla
            savedTask.totalEstimatedTimeValue = templates[0].totalEstimatedTimeValue || 0;
            savedTask.totalEstimatedTimeUnit = templates[0].totalEstimatedTimeUnit || 'minutes';
            await this.taskRepo.save(savedTask);

            this.logger.log(`Procesos heredados automáticamente de plantilla para producto ${order.productId} (${autoProcesses.length} pasos)`);
          } else {
            // No hay plantilla → notificar al admin
            ordersWithoutProcesses.push(order.product?.name || order.orderNumber || 'Producto');
          }
        }
      }

      // ── Notificar a los admins si hay órdenes sin procesos ──
      if (ordersWithoutProcesses.length > 0) {
        try {
          const admins = await this.userRepo.find({ where: { role: UserRole.ADMIN, activo: true } });
          const adminIds = admins.map(a => a.id);

          if (adminIds.length > 0) {
            const productList = ordersWithoutProcesses.join(', ');
            await this.notificationsService.createForMany(adminIds, {
              title: 'Órdenes sin procesos definidos',
              message: `Llegaron ${ordersWithoutProcesses.length} orden(es) de producción nuevas que no tienen procesos creados: ${productList}. Ve a la sección de Procesos para definirlos.`,
              type: NotificationType.ALERT,
              category: NotificationCategory.PRODUCTION_NO_PROCESSES,
            });
            this.logger.log(`Notificación enviada a ${adminIds.length} admins sobre ${ordersWithoutProcesses.length} órdenes sin procesos`);
          }
        } catch (err) {
          this.logger.error('Error al notificar sobre órdenes sin procesos', err.message);
        }
      }

      this.logger.log(`Sincronización completada. ${newCount} nuevas órdenes importadas.`);
    } catch (error) {
      this.logger.error('Error sincronizando órdenes desde MT', error.message);
    }
  }

  // ──────────────────────────────────────────────
  //  TAREAS (CRUD básico)
  // ──────────────────────────────────────────────

  async findAll() {
    return this.taskRepo.find({
      relations: ['processes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllMtProducts() {
    this.logger.log('Obteniendo catálogo de productos producibles desde Mundo Terapeuta...');
    try {
      const defaultMtUrl = 'http://localhost:3000/api/erp/production-orders/products-with-recipes';
      const mtUrl = process.env.MT_API_URL 
        ? `${process.env.MT_API_URL}/api/erp/production-orders/products-with-recipes` 
        : defaultMtUrl;
      
      const response = await firstValueFrom(this.httpService.get(mtUrl));
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo productos desde MT', error.message);
      return [];
    }
  }

  async findOne(id: string) {
    return this.taskRepo.findOne({ 
      where: { id },
      relations: ['assignments', 'assignments.worker', 'processes'],
    });
  }

  // ──────────────────────────────────────────────
  //  ASIGNACIONES DE TRABAJADORES
  // ──────────────────────────────────────────────

  async assignWorkers(taskId: string, dto: CreateAssignmentsDto) {
    this.logger.log(`Iniciando asignación para tarea ${taskId}. Trabajadores a asignar: ${dto.assignments.length}`);
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tarea de producción no encontrada');

    // Eliminar asignaciones previas para esta tarea de forma robusta
    const deleteResult = await this.assignmentRepo.createQueryBuilder()
      .delete()
      .where('task_id = :taskId', { taskId })
      .execute();
    
    this.logger.log(`Eliminadas ${deleteResult.affected} asignaciones previas para la tarea ${taskId}`);

    const newAssignments = dto.assignments.map(a => {
      return this.assignmentRepo.create({
        taskId,
        workerId: a.workerId,
        quantity: a.quantity,
        status: ProductionAssignmentStatus.ASSIGNED
      });
    });

    const saved = await this.assignmentRepo.save(newAssignments);
    this.logger.log(`Creadas ${saved.length} nuevas asignaciones para la tarea ${taskId}`);
    
    task.status = 'ASSIGNED';
    await this.taskRepo.save(task);

    // Notificar a cada trabajador asignado
    for (const assignment of saved) {
      try {
        await this.notificationsService.create({
          userId: assignment.workerId,
          title: 'Nueva orden de producción asignada',
          message: `Se te asignó la producción de "${task.productName}" (Orden ${task.orderNumber}) — ${assignment.quantity} unidades.`,
          type: NotificationType.ALERT,
          category: NotificationCategory.PRODUCTION_ASSIGNED,
          referenceId: task.id,
        });
      } catch (err) {
        this.logger.error(`Error al crear notificación para trabajador ${assignment.workerId}`, err.message);
      }
    }

    return saved;
  }

  async findAssignmentsForWorker(workerId: string) {
    const assignments = await this.assignmentRepo.find({
      where: { workerId },
      relations: ['task', 'task.processes', 'processTracking', 'processTracking.process', 'wasteReports'],
      order: { createdAt: 'DESC' },
    });
    
    this.logger.log(`Trabajador ${workerId} recuperó ${assignments.length} asignaciones`);
    return assignments;
  }

  async updateAssignmentStatus(assignmentId: string, status: ProductionAssignmentStatus) {
    const assignment = await this.assignmentRepo.findOne({ 
      where: { id: assignmentId },
      relations: ['task'],
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    assignment.status = status;
    if (status === ProductionAssignmentStatus.IN_PROGRESS) {
      assignment.startedAt = new Date();
    } else if (status === ProductionAssignmentStatus.COMPLETED) {
      assignment.completedAt = new Date();
    }

    return this.assignmentRepo.save(assignment);
  }

  async unassignWorkers(taskId: string) {
    this.logger.log(`Cancelando todas las asignaciones para la tarea ${taskId}`);
    
    const deleteResult = await this.assignmentRepo.createQueryBuilder()
      .delete()
      .where('task_id = :taskId', { taskId })
      .execute();
    
    this.logger.log(`Eliminadas ${deleteResult.affected} asignaciones para resetear la tarea ${taskId}`);

    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (task) {
      task.status = 'DRAFT';
      await this.taskRepo.save(task);
    }

    return { affected: deleteResult.affected, status: 'DRAFT' };
  }

  // ──────────────────────────────────────────────
  //  PROCESOS (Definidos por el admin por tarea)
  // ──────────────────────────────────────────────

  async getProcessesForTask(taskId: string) {
    return this.processRepo.find({
      where: { taskId },
      order: { orderIndex: 'ASC' },
    });
  }

  async setProcessesForTask(taskId: string, dto: SetProcessesDto) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tarea de producción no encontrada');

    // Eliminar procesos anteriores
    await this.processRepo.delete({ taskId });

    // Crear nuevos procesos
    const newProcesses = dto.processes.map(p =>
      this.processRepo.create({
        taskId,
        orderIndex: p.orderIndex,
        name: p.name,
        description: p.description || '',
        estimatedTimeValue: p.estimatedTimeValue,
        estimatedTimeUnit: p.estimatedTimeUnit || 'minutes',
      }),
    );

    const saved = await this.processRepo.save(newProcesses);
    this.logger.log(`Guardados ${saved.length} procesos para la tarea ${taskId}`);

    // ── Guardar tiempo total estimado en la tarea ──
    if (dto.totalEstimatedTimeValue !== undefined) {
      task.totalEstimatedTimeValue = dto.totalEstimatedTimeValue;
      task.totalEstimatedTimeUnit = dto.totalEstimatedTimeUnit || 'minutes';
      await this.taskRepo.save(task);
    }

    // ── Actualizar o crear la plantilla para futuras órdenes del mismo producto ──
    if (task.productId) {
      await this.upsertProcessTemplate(task.productId, task.productName, dto);
    }

    return saved;
  }

  /** Crea o actualiza la plantilla de procesos para un producto */
  private async upsertProcessTemplate(productId: string, productName: string, dto: SetProcessesDto) {
    try {
      // Eliminar plantilla anterior para este producto
      await this.templateRepo.delete({ productId });

      // Crear nueva plantilla
      const newTemplates = dto.processes.map(p =>
        this.templateRepo.create({
          productId,
          productName,
          orderIndex: p.orderIndex,
          name: p.name,
          description: p.description || '',
          estimatedTimeValue: p.estimatedTimeValue,
          estimatedTimeUnit: p.estimatedTimeUnit || 'minutes',
          totalEstimatedTimeValue: dto.totalEstimatedTimeValue || 0,
          totalEstimatedTimeUnit: dto.totalEstimatedTimeUnit || 'minutes',
        }),
      );

      await this.templateRepo.save(newTemplates);
      this.logger.log(`Plantilla actualizada para producto ${productId} (${newTemplates.length} pasos)`);
    } catch (err) {
      this.logger.error(`Error al guardar plantilla para producto ${productId}`, err.message);
    }
  }

  // ──────────────────────────────────────────────
  //  TRACKING DE PROCESOS (Ejecutado por el trabajador)
  // ──────────────────────────────────────────────

  /** Obtener el progreso actual de un trabajador en una asignación */
  async getTrackingForAssignment(assignmentId: string) {
    return this.trackingRepo.find({
      where: { assignmentId },
      relations: ['process'],
      order: { createdAt: 'ASC' },
    });
  }

  /** Iniciar un proceso - solo si el anterior ya fue completado */
  async startProcess(assignmentId: string, processId: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['task', 'task.processes'],
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    const process = assignment.task.processes.find(p => p.id === processId);
    if (!process) throw new NotFoundException('Proceso no encontrado en esta tarea');

    // Verificar que no haya un proceso activo (sin completar) en este assignment
    const activeProcess = await this.trackingRepo.findOne({
      where: { assignmentId, completedAt: null as any },
    });
    // Si hay un proceso activo que NO es null (tiene startedAt pero no completedAt)
    if (activeProcess && activeProcess.startedAt) {
      throw new BadRequestException('Ya hay un proceso en curso. Finalízalo antes de iniciar otro.');
    }

    // Verificar secuencia: todos los procesos con orderIndex menor deben estar completados
    const sortedProcesses = [...assignment.task.processes].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sortedProcesses.findIndex(p => p.id === processId);

    if (currentIndex > 0) {
      const previousProcessIds = sortedProcesses.slice(0, currentIndex).map(p => p.id);
      const completedTracking = await this.trackingRepo.find({
        where: previousProcessIds.map(pid => ({ assignmentId, processId: pid })),
      });
      const completedIds = completedTracking.filter(t => t.completedAt).map(t => t.processId);
      const allPreviousCompleted = previousProcessIds.every(pid => completedIds.includes(pid));
      
      if (!allPreviousCompleted) {
        throw new BadRequestException('Debes completar los procesos anteriores antes de continuar.');
      }
    }

    // Si el assignment estaba en ASSIGNED, cambiarlo a IN_PROGRESS
    if (assignment.status === ProductionAssignmentStatus.ASSIGNED) {
      assignment.status = ProductionAssignmentStatus.IN_PROGRESS;
      assignment.startedAt = new Date();
      await this.assignmentRepo.save(assignment);
    }

    // Crear el registro de tracking
    const tracking = this.trackingRepo.create({
      assignmentId,
      processId,
      startedAt: new Date(),
    });

    const saved = await this.trackingRepo.save(tracking);
    this.logger.log(`Trabajador inició proceso ${process.name} (index ${process.orderIndex}) en asignación ${assignmentId}`);
    return saved;
  }

  /** Finalizar un proceso */
  async completeProcess(assignmentId: string, processId: string) {
    const tracking = await this.trackingRepo.findOne({
      where: { assignmentId, processId, completedAt: null as any },
    });

    if (!tracking || !tracking.startedAt) {
      throw new BadRequestException('No se encontró un proceso en curso para finalizar.');
    }

    tracking.completedAt = new Date();
    tracking.durationSeconds = Math.floor((tracking.completedAt.getTime() - tracking.startedAt.getTime()) / 1000);

    const saved = await this.trackingRepo.save(tracking);
    this.logger.log(`Proceso ${processId} completado. Duración: ${tracking.durationSeconds}s`);
    return saved;
  }

  // ──────────────────────────────────────────────
  //  MERMAS (Reportadas por el trabajador al finalizar)
  // ──────────────────────────────────────────────

  async reportWaste(assignmentId: string, dto: ReportWasteDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['task'],
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    // Guardar cada item de merma
    const wasteEntries = dto.items.map(item =>
      this.wasteRepo.create({
        assignmentId,
        productId: item.productId,
        productName: item.productName,
        itemType: item.itemType,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        notes: item.notes,
      }),
    );

    const saved = await this.wasteRepo.save(wasteEntries);
    this.logger.log(`Registradas ${saved.length} mermas para la asignación ${assignmentId}`);
    return saved;
  }

  /** Finalizar completamente una asignación (después de todos los procesos y reporte de merma) */
  async completeAssignment(assignmentId: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['task', 'task.processes'],
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    // Verificar que todos los procesos hayan sido completados
    const processes = assignment.task.processes || [];
    if (processes.length > 0) {
      const tracking = await this.trackingRepo.find({ where: { assignmentId } });
      const completedTrackingProcessIds = tracking.filter(t => t.completedAt).map(t => t.processId);
      const allCompleted = processes.every(p => completedTrackingProcessIds.includes(p.id));

      if (!allCompleted) {
        throw new BadRequestException('Aún hay procesos pendientes por completar.');
      }
    }

    assignment.status = ProductionAssignmentStatus.COMPLETED;
    assignment.completedAt = new Date();
    const saved = await this.assignmentRepo.save(assignment);

    this.logger.log(`Asignación ${assignmentId} marcada como COMPLETED`);

    // Verificar si TODAS las asignaciones de esta tarea están completadas
    await this.checkAndNotifyTaskCompletion(assignment.taskId, assignment.task.productName, assignment.task.orderNumber);

    return saved;
  }

  /** Verifica si todas las asignaciones de una tarea fueron completadas y notifica a los admins */
  private async checkAndNotifyTaskCompletion(taskId: string, productName: string, orderNumber: string) {
    try {
      const allAssignments = await this.assignmentRepo.find({ where: { taskId } });
      const allCompleted = allAssignments.length > 0 && allAssignments.every(
        a => a.status === ProductionAssignmentStatus.COMPLETED,
      );

      if (allCompleted) {
        this.logger.log(`Todas las asignaciones para la tarea ${taskId} (${productName}) están completadas. Notificando admins.`);

        // Actualizar estado de la tarea
        await this.taskRepo.update(taskId, { status: 'COMPLETED' });

        // Obtener todos los admins
        const admins = await this.userRepo.find({ where: { role: UserRole.ADMIN, activo: true } });
        const adminIds = admins.map(a => a.id);

        if (adminIds.length > 0) {
          await this.notificationsService.createForMany(adminIds, {
            title: 'Producción completada',
            message: `Todos los trabajadores han finalizado la producción de "${productName}" (Orden ${orderNumber}).`,
            type: NotificationType.SUCCESS,
            category: NotificationCategory.PRODUCTION_COMPLETED,
            referenceId: taskId,
          });
        }
      }
    } catch (err) {
      this.logger.error(`Error al verificar/notificar completitud de tarea ${taskId}`, err.message);
    }
  }

  /** Obtener mermas de todas las asignaciones (para vista admin) */
  async findAllWaste() {
    return this.wasteRepo.find({
      relations: ['assignment', 'assignment.task', 'assignment.worker'],
      order: { createdAt: 'DESC' },
    });
  }

  // ──────────────────────────────────────────────
  //  REPORTAR COMPLETITUD A MUNDO TERAPEUTA
  // ──────────────────────────────────────────────

  /** Envía al backend de MT la notificación de que la orden fue completada */
  async reportCompletionToMT(taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tarea de producción no encontrada');

    if (task.status !== 'COMPLETED') {
      throw new BadRequestException('Solo se pueden reportar órdenes completadas.');
    }

    const defaultMtUrl = 'http://localhost:3000/api/erp/production-orders';
    const mtBaseUrl = process.env.MT_API_URL
      ? `${process.env.MT_API_URL}/api/erp/production-orders`
      : defaultMtUrl;

    const mtUrl = `${mtBaseUrl}/${task.externalMtId}/report-completed`;

    this.logger.log(`Reportando completitud a MT: ${mtUrl} (cantidad: ${task.quantityToProduce})`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(mtUrl, {
          quantityProduced: Number(task.quantityToProduce),
        }),
      );

      // Marcar la tarea como reportada para que el admin sepa que ya se envió
      task.status = 'REPORTED_TO_MT';
      await this.taskRepo.save(task);

      this.logger.log(`Orden ${taskId} reportada exitosamente a MT. Respuesta: ${JSON.stringify(response.data)}`);
      return { success: true, mtResponse: response.data };
    } catch (error) {
      this.logger.error(`Error reportando a MT: ${error.message}`);
      throw new BadRequestException(`Error al comunicar con Mundo Terapeuta: ${error.message}`);
    }
  }

  // ──────────────────────────────────────────────
  //  LIMPIAR NOTIFICACIONES DE "SIN PROCESOS"
  // ──────────────────────────────────────────────

  /** Limpia las notificaciones de tipo PRODUCTION_NO_PROCESSES para un admin (cuando entra a la tab de Procesos) */
  async clearNoProcessNotifications(userId: string) {
    return this.notificationsService.deleteForUser(userId, NotificationCategory.PRODUCTION_NO_PROCESSES);
  }

  /** Limpiar notificaciones de "Nueva orden asignada" para el trabajador */
  async clearAssignedNotifications(userId: string) {
    return this.notificationsService.deleteForUser(userId, NotificationCategory.PRODUCTION_ASSIGNED);
  }
}
