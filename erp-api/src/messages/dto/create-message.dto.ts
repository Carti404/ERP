import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  recipientId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  body: string;
}
