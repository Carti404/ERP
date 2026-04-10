import { Controller, Get, Param, UseGuards, Post, Body, Patch, Delete } from '@nestjs/common';
import { ProductionSyncService } from './production.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateAssignmentsDto } from './dto/create-assignments.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { SetProcessesDto } from './dto/set-processes.dto';
import { ReportWasteDto } from './dto/report-waste.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionSyncService) {}

  // ──── TAREAS ────

  @Get()
  @Roles(UserRole.ADMIN)
  async getProductionTasks() {
    return this.productionService.findAll();
  }

  @Get('my-assignments')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async getMyAssignments(@CurrentUser() user: any) {
    return this.productionService.findAssignmentsForWorker(user.userId);
  }

  @Get('mt-products')
  @Roles(UserRole.ADMIN)
  async getMtProducts() {
    return this.productionService.findAllMtProducts();
  }

  @Get('waste')
  @Roles(UserRole.ADMIN)
  async getAllWaste() {
    return this.productionService.findAllWaste();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getProductionTask(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN)
  async assignWorkers(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentsDto
  ) {
    return this.productionService.assignWorkers(id, dto);
  }

  @Patch('assignments/:id/status')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async updateAssignmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentStatusDto
  ) {
    return this.productionService.updateAssignmentStatus(id, dto.status);
  }

  @Delete(':id/assign')
  @Roles(UserRole.ADMIN)
  async unassignWorkers(@Param('id') id: string) {
    return this.productionService.unassignWorkers(id);
  }

  // ──── PROCESOS (Admin define los pasos de cada tarea) ────

  @Get(':id/processes')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  async getProcesses(@Param('id') taskId: string) {
    return this.productionService.getProcessesForTask(taskId);
  }

  @Post(':id/processes')
  @Roles(UserRole.ADMIN)
  async setProcesses(
    @Param('id') taskId: string,
    @Body() dto: SetProcessesDto
  ) {
    return this.productionService.setProcessesForTask(taskId, dto);
  }

  // ──── TRACKING DE PROCESOS (Trabajador ejecuta paso a paso) ────

  @Get('assignments/:id/tracking')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  async getTracking(@Param('id') assignmentId: string) {
    return this.productionService.getTrackingForAssignment(assignmentId);
  }

  @Post('assignments/:id/processes/:processId/start')
  @Roles(UserRole.WORKER)
  async startProcess(
    @Param('id') assignmentId: string,
    @Param('processId') processId: string,
  ) {
    return this.productionService.startProcess(assignmentId, processId);
  }

  @Post('assignments/:id/processes/:processId/complete')
  @Roles(UserRole.WORKER)
  async completeProcess(
    @Param('id') assignmentId: string,
    @Param('processId') processId: string,
  ) {
    return this.productionService.completeProcess(assignmentId, processId);
  }

  // ──── MERMAS Y FINALIZACIÓN ────

  @Post('assignments/:id/waste')
  @Roles(UserRole.WORKER)
  async reportWaste(
    @Param('id') assignmentId: string,
    @Body() dto: ReportWasteDto,
  ) {
    return this.productionService.reportWaste(assignmentId, dto);
  }

  @Post('assignments/:id/complete')
  @Roles(UserRole.WORKER)
  async completeAssignment(@Param('id') assignmentId: string) {
    return this.productionService.completeAssignment(assignmentId);
  }

  // ──── REPORTAR A MUNDO TERAPEUTA ────

  @Post(':id/report-to-mt')
  @Roles(UserRole.ADMIN)
  async reportToMT(@Param('id') taskId: string) {
    return this.productionService.reportCompletionToMT(taskId);
  }

  // ──── LIMPIEZA DE NOTIFICACIONES DE PROCESOS ────

  @Post('clear-no-process-notifications')
  @Roles(UserRole.ADMIN)
  async clearNoProcessNotifications(@CurrentUser() user: any) {
    const deleted = await this.productionService.clearNoProcessNotifications(user.userId);
    return { cleared: deleted };
  }

  @Post('clear-assigned-notifications')
  @Roles(UserRole.WORKER)
  async clearAssignedNotifications(@CurrentUser() user: any) {
    return this.productionService.clearAssignedNotifications(user.userId);
  }
}
