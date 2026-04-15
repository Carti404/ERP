import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, Not, Between, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { ProductionTask } from '../production/entities/production-task.entity';
import { ProductionWaste } from '../production/entities/production-waste.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(ProductionTask)
    private readonly taskRepo: Repository<ProductionTask>,
    @InjectRepository(ProductionWaste)
    private readonly wasteRepo: Repository<ProductionWaste>,
  ) {}

  async getAdminKpis() {
    this.logger.log('Calculando KPIs generales para administrador');

    // 1. Mermas (Semana actual: desde el último lunes)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const mermasCount = await this.wasteRepo.count({
      where: { createdAt: MoreThanOrEqual(monday) },
    });

    // 2. Asistencia hoy (Porcentaje sobre trabajadores activos)
    const todayStr = now.toISOString().split('T')[0];
    const totalWorkers = await this.userRepo.count({
      where: { role: UserRole.WORKER, activo: true },
    });

    const presentWorkers = await this.attendanceRepo.count({
      where: {
        workDate: todayStr,
        status: Not('Falta'),
      },
    });

    const attendancePercentage = totalWorkers > 0 
      ? Math.round((presentWorkers / totalWorkers) * 100) 
      : 0;

    // 3. Órdenes sin asignar (Tareas que están en estado inicial DRAFT)
    const unassignedTasks = await this.taskRepo.count({
      where: { status: 'DRAFT' },
    });

    return {
      mermas: {
        count: mermasCount,
        label: `${mermasCount} reportes`,
      },
      asistencia: {
        percentage: attendancePercentage,
        label: `${attendancePercentage}%`,
      },
      cierres: {
        count: unassignedTasks,
        label: `${unassignedTasks}`,
      },
    };
  }

  async getAttendanceSummary(year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const totalWorkers = await this.userRepo.count({
      where: { role: UserRole.WORKER, activo: true },
    });

    const records = await this.attendanceRepo.find({
      where: {
        workDate: Between(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ),
      },
    });

    // Agrupar por fecha
    const summary: Record<string, { day: number; kind: 'ok' | 'warning' | 'critical' | 'weekend' | 'muted' }> = {};
    
    // Inicializar todos los días del mes
    for (let d = 1; d <= endDate.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const isSunday = date.getDay() === 0;
      
      summary[dateStr] = {
        day: d,
        kind: isSunday ? 'weekend' : 'muted',
      };
    }

    // Procesar registros
    const recordsByDate: Record<string, { faltas: number; retardos: number; present: number }> = {};
    
    records.forEach(r => {
      if (!recordsByDate[r.workDate]) {
        recordsByDate[r.workDate] = { faltas: 0, retardos: 0, present: 0 };
      }
      if (r.status === 'Falta') recordsByDate[r.workDate].faltas++;
      else if (r.status === 'Retardo') recordsByDate[r.workDate].retardos++;
      
      if (r.status !== 'Falta') recordsByDate[r.workDate].present++;
    });

    // Determinar colores
    Object.keys(recordsByDate).forEach(dateStr => {
      const stats = recordsByDate[dateStr];
      const dayData = summary[dateStr];
      if (!dayData || dayData.kind === 'weekend') return;

      if (stats.faltas >= 3) {
        dayData.kind = 'critical';
      } else if (stats.retardos >= 3) {
        dayData.kind = 'warning';
      } else if (stats.present >= totalWorkers && totalWorkers > 0) {
        dayData.kind = 'ok';
      }
    });

    return Object.values(summary).sort((a, b) => a.day - b.day);
  }

  async getAssignedOrders() {
    this.logger.log('Obteniendo órdenes de producción asignadas para panel admin');
    
    const tasks = await this.taskRepo.find({
      where: {
        status: In(['ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL']),
      },
      relations: ['assignments', 'assignments.worker'],
      order: { updatedAt: 'DESC' },
    });

    return tasks.map(t => ({
      id: t.id,
      orderNumber: t.orderNumber,
      productName: t.productName,
      status: t.status,
      workers: t.assignments.map(a => a.worker?.fullName).filter(Boolean),
    }));
  }
}
