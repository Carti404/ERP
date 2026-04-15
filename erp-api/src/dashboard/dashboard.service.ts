import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, Not, Between, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { ProductionTask } from '../production/entities/production-task.entity';
import { ProductionWaste } from '../production/entities/production-waste.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { SystemParametersService } from '../system-parameters/system-parameters.service';

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
    private readonly systemParamsService: SystemParametersService,
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
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const totalWorkers = await this.userRepo.count({
      where: { role: UserRole.WORKER, activo: true },
    });

    // Contamos CUALQUIER registro de hoy como presente (sin importar si decian Falta por la lógica antigua)
    // Ya que la regla de negocio actual es que las verdaderas Faltas son la ausencia de registro al final del día.
    const presentWorkers = await this.attendanceRepo.count({
      where: {
        workDate: todayStr,
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

    const [totalWorkers, records, params] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.WORKER, activo: true } }),
      this.attendanceRepo.find({
        where: {
          workDate: Between(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          ),
        },
      }),
      this.systemParamsService.getSnapshot(),
    ]);

    const holidayDates = new Set(params.holidays.map(h => h.date));
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Agrupar por fecha
    const summary: Record<string, { day: number; kind: 'ok' | 'warning' | 'critical' | 'weekend' | 'muted' }> = {};
    
    // Nombres de meses en español
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthTitle = `Control de Asistencia - ${monthNames[month]} ${year}`;

    // Inicializar todos los días del mes
    for (let d = 1; d <= endDate.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(year, month, d);
      const isSunday = date.getDay() === 0;
      const isHoliday = holidayDates.has(dateStr);
      
      summary[dateStr] = {
        day: d,
        kind: (isSunday || isHoliday) ? 'weekend' : 'muted',
      };
    }

    // Procesar registros existentes
    const recordsByDate: Record<string, { faltas: number; retardos: number; present: number }> = {};
    
    records.forEach(r => {
      if (!recordsByDate[r.workDate]) {
        recordsByDate[r.workDate] = { faltas: 0, retardos: 0, present: 0 };
      }
      
      // IMPORTANTE: Si tiene registro (aunque sea 'Falta' por lógica antigua), SÍ se presentó.
      recordsByDate[r.workDate].present++;

      // Tratamos cualquier registro que no sea Puntual como Retardo (igual que en la Matriz)
      // dejando las "Faltas" estrictamente para aquellos sin ningún registro.
      if (r.status !== 'Puntual') {
        recordsByDate[r.workDate].retardos++;
      }
    });

    // Determinar colores y detectar ausencias
    Object.keys(summary).forEach(dateStr => {
      const dayData = summary[dateStr];
      if (dayData.kind === 'weekend') return;

      const stats = recordsByDate[dateStr] || { present: 0, retardos: 0 };
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      
      // Calculamos faltas reales: trabajadores que NO tienen registro
      const realFaltas = totalWorkers - stats.present;

      if (isPast) {
        // En días pasados, aplicamos los umbrales de cierre
        if (realFaltas >= 3) {
          dayData.kind = 'critical'; // Rojo si faltaron 3 o más
        } else if (stats.retardos >= 3) {
          dayData.kind = 'warning'; // Naranja si llegaron 3 o más tarde
        } else if (stats.present > 0) {
          dayData.kind = 'ok'; // Verde si la operación fue normal
        } else {
          // Si no hubo registros en absoluto
          dayData.kind = 'critical';
        }
      } else if (isToday) {
        // Para hoy, si ya hay 3+ retardos, avisamos
        if (stats.retardos >= 3) {
          dayData.kind = 'warning';
        } else if (stats.present > 0) {
          dayData.kind = 'ok';
        }
      }
      // Los días futuros permanecen en 'muted' (gris)
    });

    // Alineación para que el día 1 caiga en el día de la semana correcto
    const firstDay = new Date(year, month, 1).getDay(); // 0: Dom, 1: Lun...
    const paddingCount = firstDay === 0 ? 6 : firstDay - 1; // Ajustar a Lunes como día 1
    
    const daysArray = Object.values(summary).sort((a, b) => a.day - b.day);
    const paddedDays: any[] = [];
    
    for (let i = 0; i < paddingCount; i++) {
       paddedDays.push({ day: 0, kind: 'muted', isPadding: true });
    }

    return {
      title: monthTitle,
      days: [...paddedDays, ...daysArray]
    };
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
