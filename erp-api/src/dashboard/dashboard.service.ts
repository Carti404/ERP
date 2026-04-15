import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, Not } from 'typeorm';
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

    // 3. Cierres pendientes (Tareas completadas por operarios, esperando acción admin)
    const pendingClosures = await this.taskRepo.count({
      where: { status: 'COMPLETED' },
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
        count: pendingClosures,
        label: `${pendingClosures}`,
      },
    };
  }
}
