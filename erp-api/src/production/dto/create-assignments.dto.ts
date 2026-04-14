import { IsUUID, IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentItemDto {
  @IsUUID()
  workerId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  processIds?: string[];
}

export class CreateAssignmentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments: AssignmentItemDto[];
}
