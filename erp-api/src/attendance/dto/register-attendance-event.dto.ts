import { IsEnum, IsNotEmpty } from 'class-validator';
import { AttendanceEventType } from '../../common/enums/attendance-event-type.enum';

export class RegisterAttendanceEventDto {
  @IsNotEmpty()
  @IsEnum(AttendanceEventType)
  eventType: AttendanceEventType;
}
