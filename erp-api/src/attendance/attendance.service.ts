import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceLog } from './entities/attendance-log.entity';
import { RegisterAttendanceEventDto } from './dto/register-attendance-event.dto';
import { AttendanceEventType } from '../common/enums/attendance-event-type.enum';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { Between } from 'typeorm';
import { AttendanceMatrixQueryDto } from './dto/attendance-matrix-query.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly recordRepository: Repository<AttendanceRecord>,
    @InjectRepository(AttendanceLog)
    private readonly logRepository: Repository<AttendanceLog>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Obtiene la asistencia del día para el usuario (incluye logs del día de hoy).
   */
  async getTodayStatus(userId: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    let record = await this.recordRepository.findOne({
      where: { userId, workDate: today },
      relations: ['logs'],
    });

    return record || { message: 'No hay registro todavía', logs: [] };
  }

  /**
   * Obtiene todo el historial del usuario.
   */
  async getMyHistory(userId: string) {
    return await this.recordRepository.find({
      where: { userId },
      relations: ['logs'],
      order: { workDate: 'DESC' },
    });
  }

  /**
   * Maneja el clic en algún botón del checador creando o actualizando
   * el récord diario y escribiendo la bitácora exacta del evento.
   */
  async registerEvent(userId: string, registerDto: RegisterAttendanceEventDto) {
    const today = new Date().toISOString().split('T')[0];
    const { eventType } = registerDto;
    
    let record = await this.recordRepository.findOne({
      where: { userId, workDate: today },
    });

    if (!record) {
      // Validar que el primer evento sea un INICIO o CLOCK_IN
      if (eventType !== AttendanceEventType.CLOCK_IN) {
        throw new BadRequestException('El turno aún no ha sido iniciado el día de hoy');
      }

      // TODO: Comparar con "Parámetros de sistema" para calcular si es Puntual
      // Por ahora asignaremos que es puntual por defecto:
      const calculatedStatus = 'Puntual'; 

      record = this.recordRepository.create({
        userId: userId,
        workDate: today,
        status: calculatedStatus,
      });

      record = await this.recordRepository.save(record);
    } else {
      // Prevenir múltiples CLOCK_INs en el mismo día (según reglas de negocio)
      if (eventType === AttendanceEventType.CLOCK_IN) {
         // Opcionalmente podemos permitir CLOCK_IN múltiple si tiene sentido en su industria
         throw new BadRequestException('Ya existe un inicio de turno para este día');
      }
    }

    // Registrar la bitácora particular
    const log = this.logRepository.create({
      attendanceRecordId: record.id,
      eventType: eventType,
      timestamp: new Date(),
    });

    await this.logRepository.save(log);

    return {
      message: `Event ${eventType} registered successfully`,
      recordId: record.id,
      timestamp: log.timestamp,
    };
  }

  /**
   * Obtiene la matriz de asistencias para todos los trabajadores activos en un rango de fechas.
   */
  async getMatrixData(query: AttendanceMatrixQueryDto) {
    const { startDate, endDate } = query;

    // 1. Obtener todos los trabajadores activos
    const allActives = await this.usersService.listActives();
    const workers = allActives.filter(u => u.role === UserRole.WORKER);

    // 2. Obtener los registros de asistencia en el rango
    const records = await this.recordRepository.find({
      where: {
        workDate: Between(startDate, endDate),
      },
      relations: ['logs'],
    });

    // 3. Estructurar para el frontend
    // Agrupamos por usuario y luego por fecha para fácil acceso
    const matrixMap: Record<string, Record<string, any>> = {};

    records.forEach(r => {
      if (!matrixMap[r.userId]) matrixMap[r.userId] = {};
      
      // Extraer CLOCK_IN y CLOCK_OUT logs si existen
      const inLog = r.logs.find(l => l.eventType === AttendanceEventType.CLOCK_IN);
      const outLog = r.logs.find(l => l.eventType === AttendanceEventType.CLOCK_OUT);

      matrixMap[r.userId][r.workDate] = {
        id: r.id,
        status: r.status,
        checkIn: inLog?.timestamp || null,
        checkOut: outLog?.timestamp || null,
      };
    });

    return {
      workers: workers.map(w => ({
        id: w.id,
        fullName: w.fullName,
        puesto: w.puesto,
      })),
      matrix: matrixMap,
      startDate,
      endDate,
    };
  }
}
