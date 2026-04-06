import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceLog } from './entities/attendance-log.entity';
import { RegisterAttendanceEventDto } from './dto/register-attendance-event.dto';
import { AttendanceEventType } from '../common/enums/attendance-event-type.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly recordRepository: Repository<AttendanceRecord>,
    @InjectRepository(AttendanceLog)
    private readonly logRepository: Repository<AttendanceLog>,
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
        user: { id: userId },
        userId: userId, // To be safe we pass both
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
}
