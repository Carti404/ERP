import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PutSystemParametersDto, UpdateHolidaysDto, UpdateScheduleDto } from './dto/put-system-parameters.dto';
import { SystemParametersService } from './system-parameters.service';

@Controller('system-parameters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemParametersController {
  constructor(private readonly systemParametersService: SystemParametersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  get() {
    return this.systemParametersService.getSnapshot();
  }

  @Put()
  @Roles(UserRole.ADMIN)
  put(@Body() dto: PutSystemParametersDto) {
    return this.systemParametersService.replaceAll(dto);
  }

  @Put('schedule')
  @Roles(UserRole.ADMIN)
  putSchedule(@Body() dto: UpdateScheduleDto) {
    return this.systemParametersService.updateSchedule(dto);
  }

  @Put('holidays')
  @Roles(UserRole.ADMIN)
  putHolidays(@Body() dto: UpdateHolidaysDto) {
    return this.systemParametersService.updateHolidays(dto);
  }
}
