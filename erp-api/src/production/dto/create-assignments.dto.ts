import { IsUUID, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentItemDto {
  @IsUUID()
  workerId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;
}

export class CreateAssignmentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments: AssignmentItemDto[];
}
