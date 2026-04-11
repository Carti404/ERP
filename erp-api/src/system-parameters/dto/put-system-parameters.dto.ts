import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScheduleBlockInputDto {
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora debe tener formato HH:mm.',
  })
  entry: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora debe tener formato HH:mm.',
  })
  exit: string;

  @IsInt()
  @Min(0)
  tolerance: number;
}

export class HolidayInputDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha del festivo debe ser YYYY-MM-DD.',
  })
  date: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sub?: string;
}

/** DTO para actualizar solo la jornada y descansos */
export class UpdateScheduleDto {
  @ValidateNested()
  @Type(() => ScheduleBlockInputDto)
  monFri: ScheduleBlockInputDto;

  @ValidateNested()
  @Type(() => ScheduleBlockInputDto)
  saturday: ScheduleBlockInputDto;

  @IsInt()
  @Min(0)
  snackMin: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora de comida debe tener formato HH:mm.',
  })
  lunchFrom: string;

  @IsInt()
  @Min(0)
  lunchDurationMin: number;
}

/** DTO para actualizar solo los festivos */
export class UpdateHolidaysDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayInputDto)
  holidays: HolidayInputDto[];
}

/** DTO original para compatibilidad (opcional mantenerlo) */
export class PutSystemParametersDto {
  @ValidateNested()
  @Type(() => ScheduleBlockInputDto)
  monFri: ScheduleBlockInputDto;

  @ValidateNested()
  @Type(() => ScheduleBlockInputDto)
  saturday: ScheduleBlockInputDto;

  @IsInt()
  @Min(0)
  snackMin: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora de comida debe tener formato HH:mm.',
  })
  lunchFrom: string;

  @IsInt()
  @Min(0)
  lunchDurationMin: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayInputDto)
  holidays: HolidayInputDto[];
}
