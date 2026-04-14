import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import {
  MessageImportance,
  MessageCategory,
} from '../entities/internal-message.entity';

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

  @IsEnum(MessageImportance)
  @IsOptional()
  importance?: MessageImportance;

  @IsEnum(MessageCategory)
  @IsOptional()
  category?: MessageCategory;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  attachmentIds?: string[];
}
