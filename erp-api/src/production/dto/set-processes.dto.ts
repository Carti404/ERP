import { IsString, IsInt, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessItemDto {
  @IsInt()
  @Min(1)
  orderIndex: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  estimatedTimeValue: number;

  @IsString()
  @IsOptional()
  estimatedTimeUnit?: string; // 'minutes', 'hours', 'days', 'weeks'
}

export class SetProcessesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessItemDto)
  processes: ProcessItemDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  totalEstimatedTimeValue?: number;

  @IsString()
  @IsOptional()
  totalEstimatedTimeUnit?: string; // 'minutes', 'hours', 'days', 'weeks'
}
