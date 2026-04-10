import { IsDateString, IsOptional } from 'class-validator';

export class AttendanceMatrixQueryDto {
  /** Fecha de inicio (YYYY-MM-DD) */
  @IsDateString()
  startDate: string;

  /** Fecha de fin (YYYY-MM-DD) */
  @IsDateString()
  endDate: string;
}
