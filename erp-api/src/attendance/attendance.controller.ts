import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceEventDto } from './dto/register-attendance-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajustado con tu JWT
import { Request } from 'express';

// Definición rápida para que tipemos la req.user
interface RequestWithUser extends Request {
  user: { userId: string; role: string }; 
}

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('today')
  getTodayStatus(@Req() req: RequestWithUser) {
    return this.attendanceService.getTodayStatus(req.user.userId);
  }

  @Get('me')
  getMyHistory(@Req() req: RequestWithUser) {
    return this.attendanceService.getMyHistory(req.user.userId);
  }

  @Post('event')
  registerEvent(@Req() req: RequestWithUser, @Body() registerDto: RegisterAttendanceEventDto) {
    return this.attendanceService.registerEvent(req.user.userId, registerDto);
  }
}
