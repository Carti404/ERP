import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaveRequestsService } from './leave-requests.service';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';
import { LeaveRequestType, LeaveRequestStatus } from './entities/leave-request.entity';

@Controller('leave-requests')
@UseGuards(JwtAuthGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveService: LeaveRequestsService) {}
  
  @Get('admin/stats')
  getAdminStats() {
    return this.leaveService.getAdminStats();
  }

  @Get('balance')
  getBalance(@Req() req: { user: JwtValidatedUser }) {
    return this.leaveService.getWorkerBalance(req.user.userId);
  }

  @Get('me')
  getMyRequests(@Req() req: { user: JwtValidatedUser }) {
    return this.leaveService.myRequests(req.user.userId);
  }

  @Get()
  getAllRequests(@Req() req: { user: JwtValidatedUser }) {
    // Aquí podríamos limitar a solo Admin, pero usaremos el mismo service para protegerlo si hace falta
    return this.leaveService.listAll();
  }

  @Post()
  createRequest(
    @Req() req: { user: JwtValidatedUser },
    @Body() body: { type: LeaveRequestType; startDate: string; endDate: string; totalDays?: number; reason: string; evidenceUrl?: string },
  ) {
    return this.leaveService.createRequest(req.user.userId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: { user: JwtValidatedUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: LeaveRequestStatus; message?: string; proposedStartDate?: string; proposedEndDate?: string },
  ) {
    return this.leaveService.updateStatus(id, req.user.userId, body);
  }
}
