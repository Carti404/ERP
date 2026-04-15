import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin-kpis')
  @Roles(UserRole.ADMIN)
  async getAdminKpis() {
    return this.dashboardService.getAdminKpis();
  }
  
  @Get('attendance-summary')
  @Roles(UserRole.ADMIN)
  async getAttendanceSummary() {
    const now = new Date();
    return this.dashboardService.getAttendanceSummary(now.getFullYear(), now.getMonth());
  }

  @Get('assigned-orders')
  @Roles(UserRole.ADMIN)
  async getAssignedOrders() {
    return this.dashboardService.getAssignedOrders();
  }
}
