import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  username: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  /** PIN numérico de 4 dígitos (MVP §6). */
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'El PIN debe ser exactamente 4 dígitos numéricos.',
  })
  pin: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  puesto?: string;

  @IsNotEmpty()
  @IsDateString()
  fechaIngreso: string;
}
