import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not } from 'typeorm';
import { LeaveRequest, LeaveRequestType, LeaveRequestStatus } from './entities/leave-request.entity';
import { LeaveRequestHistory, LeaveRequestActionType } from './entities/leave-request-history.entity';
import { UsersService } from '../users/users.service';
import { calculateVacationDays, countWorkingDays } from '../common/utils/vacation.utils';
import { SystemParametersService } from '../system-parameters/system-parameters.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly requestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveRequestHistory)
    private readonly historyRepo: Repository<LeaveRequestHistory>,
    private readonly usersService: UsersService,
    private readonly systemParams: SystemParametersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getWorkerBalance(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const params = await this.systemParams.getSnapshot();
    const totalAssigned = calculateVacationDays(user.fechaIngreso, params.vacationDeductionDays ?? 0);

    const approvedVacations = await this.requestRepo.find({
      where: {
        userId,
        type: LeaveRequestType.VACATION,
        status: In([LeaveRequestStatus.APPROVED]),
      },
    });

    const usedDays = approvedVacations.reduce((sum, req) => sum + req.totalDays, 0);

    return {
      fechaIngreso: user.fechaIngreso,
      totalAssigned,
      usedDays,
      availableDays: Math.max(0, totalAssigned - usedDays),
    };
  }

  async myRequests(userId: string) {
    return this.requestRepo.find({
      where: { userId },
      relations: ['user', 'history', 'history.author'],
      order: { createdAt: 'DESC', history: { createdAt: 'ASC' } },
    });
  }

  async listAll() {
    return this.requestRepo.find({
      relations: ['user', 'history', 'history.author'],
      order: { createdAt: 'DESC', history: { createdAt: 'ASC' } },
    });
  }

  async createRequest(userId: string, data: { type: LeaveRequestType; startDate: string; endDate: string; totalDays?: number; reason: string; evidenceUrl?: string; segments?: { start: string, end: string, count: number }[] }) {
    const params = await this.systemParams.getSnapshot();
    const holidayDates = params.holidays.map(h => h.date);
    const totalDays = data.totalDays ?? countWorkingDays(data.startDate, data.endDate, holidayDates);

    if (data.type === LeaveRequestType.VACATION) {
      const balance = await this.getWorkerBalance(userId);
      if (totalDays > balance.availableDays) {
        throw new BadRequestException('No tienes suficientes días de vacaciones disponibles para esta solicitud.');
      }
    }

    const doc = this.requestRepo.create({
      userId,
      ...data,
      totalDays,
    });

    const saved = await this.requestRepo.save(doc);

    // Initial history record
    const history = this.historyRepo.create({
      leaveRequestId: saved.id,
      authorId: userId,
      actionType: LeaveRequestActionType.CREATED,
      message: data.reason,
    });
    await this.historyRepo.save(history);

    // Notificar a administradores
    const admins = await this.usersService.findAdmins();
    const adminIds = admins.map(a => a.id);
    const worker = await this.usersService.findById(userId);
    
    if (adminIds.length > 0) {
      await this.notificationsService.createForMany(adminIds, {
        title: 'Nueva solicitud de permiso/vacaciones',
        message: `${worker?.fullName || 'Un trabajador'} ha solicitado ${data.type === LeaveRequestType.VACATION ? 'vacaciones' : 'un permiso'}.`,
        category: NotificationCategory.LEAVE_REQUEST,
        type: NotificationType.INFO,
        referenceId: saved.id,
      });
    }

    return saved;
  }

  async updateStatus(id: string, authorId: string, data: { status: LeaveRequestStatus; message?: string; proposedStartDate?: string; proposedEndDate?: string; proposedSegments?: { start: string, end: string, count: number }[] }) {
    const req = await this.requestRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    req.status = data.status;
    
    // Si el admin propone otras fechas y el trabajador acepta, o si el admin cambia
    if (data.status === LeaveRequestStatus.ADMIN_PROPOSAL) {
      // no actualizamos los dias de la request base aun, hasta que acepten
    } else if (data.status === LeaveRequestStatus.APPROVED) {
      if (data.proposedSegments && data.proposedSegments.length > 0) {
        req.segments = data.proposedSegments;
        req.totalDays = req.segments.reduce((sum, seg) => sum + (seg.count || countWorkingDays(seg.start, seg.end)), 0);
        // Si hay segmentos, el start/end global es el del primer y último segmento
        req.startDate = new Date(req.segments[0].start);
        req.endDate = new Date(req.segments[req.segments.length - 1].end);
      } else if (data.proposedStartDate) {
        const start = data.proposedStartDate;
        const end = data.proposedEndDate || start;
        req.startDate = new Date(start);
        req.endDate = new Date(end);
        
        const holidayDates = (await this.systemParams.getSnapshot()).holidays.map(h => h.date);
        req.totalDays = countWorkingDays(req.startDate, req.endDate, holidayDates);
        req.segments = [{ start: data.proposedStartDate, end: data.proposedEndDate || data.proposedStartDate, count: req.totalDays }];
      }
    }
    
    await this.requestRepo.save(req);

    const history = this.historyRepo.create({
      leaveRequestId: req.id,
      authorId: authorId,
      actionType: data.status as unknown as LeaveRequestActionType,
      message: data.message || '',
      proposedStartDate: data.proposedStartDate ? new Date(data.proposedStartDate) : null,
      proposedEndDate: data.proposedEndDate ? new Date(data.proposedEndDate) : null,
      proposedSegments: data.proposedSegments || null,
    });
    await this.historyRepo.save(history);

    // Notificar si es una apelación del trabajador
    if (data.status === LeaveRequestStatus.WORKER_APPEAL) {
      const admins = await this.usersService.findAdmins();
      const adminIds = admins.map(a => a.id);
      const worker = await this.usersService.findById(req.userId);
      
      if (adminIds.length > 0) {
        await this.notificationsService.createForMany(adminIds, {
          title: 'Apelación de fechas recibida',
          message: `${worker?.fullName || 'Un trabajador'} ha propuesto nuevas fechas para su solicitud.`,
          category: NotificationCategory.LEAVE_REQUEST,
          type: NotificationType.INFO,
          referenceId: req.id,
        });
      }
    } else if (data.status === LeaveRequestStatus.APPROVED || data.status === LeaveRequestStatus.REJECTED || data.status === LeaveRequestStatus.ADMIN_PROPOSAL) {
        // En estos casos notificar al TRABAJADOR
        await this.notificationsService.create({
            userId: req.userId,
            title: `Tu solicitud ha sido ${data.status === LeaveRequestStatus.APPROVED ? 'aprobada' : data.status === LeaveRequestStatus.REJECTED ? 'rechazada' : 'actualizada con una propuesta'}`,
            message: data.message || 'Se ha actualizado el estado de tu solicitud.',
            category: NotificationCategory.LEAVE_REQUEST,
            type: data.status === LeaveRequestStatus.REJECTED ? NotificationType.ALERT : NotificationType.SUCCESS,
            referenceId: req.id,
        });
    }

    return req;
  }

  async getAdminStats() {
    const activeWorkers = await this.usersService.listActives();
    const pendingRequests = await this.requestRepo.find({
      where: { status: LeaveRequestStatus.PENDING },
    });

    return {
      totalActiveWorkers: activeWorkers.length,
      pendingRequests: pendingRequests.length,
    };
  }
}
