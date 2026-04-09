import { IsEnum } from 'class-validator';
import { ProductionAssignmentStatus } from '../../common/enums/production-assignment-status.enum';

export class UpdateAssignmentStatusDto {
  @IsEnum(ProductionAssignmentStatus)
  status: ProductionAssignmentStatus;
}
