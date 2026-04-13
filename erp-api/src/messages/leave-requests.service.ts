import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not } from 'typeorm';
import { LeaveRequest, LeaveRequestType, LeaveRequestStatus } from './entities/leave-request.entity';
import { LeaveRequestHistory, LeaveRequestActionType } from './entities/leave-request-history.entity';
import { UsersService } from '../users/users.service';
import { calculateVacationDays, countWorkingDays } from '../common/utils/vacation.utils';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly requestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveRequestHistory)
    private readonly historyRepo: Repository<LeaveRequestHistory>,
    private readonly usersService: UsersService,
  ) {}

  async getWorkerBalance(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const totalAssigned = calculateVacationDays(user.fechaIngreso);

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
    const totalDays = data.totalDays ?? countWorkingDays(data.startDate, data.endDate);

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

    return saved;
  }

  async updateStatus(id: string, authorId: string, data: { status: LeaveRequestStatus; message?: string; proposedStartDate?: string; proposedEndDate?: string }) {
    const req = await this.requestRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');

    req.status = data.status;
    
    // Si el admin propone otras fechas y el trabajador acepta, o si el admin cambia
    if (data.status === LeaveRequestStatus.ADMIN_PROPOSAL) {
      // no actualizamos los dias de la request base aun, hasta que acepten
    } else if (data.status === LeaveRequestStatus.APPROVED && data.proposedStartDate) {
      req.startDate = new Date(data.proposedStartDate);
      req.endDate = new Date(data.proposedEndDate || data.proposedStartDate);
      req.totalDays = countWorkingDays(req.startDate, req.endDate);
    }
    
    await this.requestRepo.save(req);

    const history = this.historyRepo.create({
      leaveRequestId: req.id,
      authorId: authorId,
      actionType: data.status as unknown as LeaveRequestActionType,
      message: data.message || '',
      proposedStartDate: data.proposedStartDate ? new Date(data.proposedStartDate) : null,
      proposedEndDate: data.proposedEndDate ? new Date(data.proposedEndDate) : null,
    });
    await this.historyRepo.save(history);

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
