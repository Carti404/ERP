import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { UserRole } from '../../common/enums/user-role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName?: string;

  /** `null` limpia el correo. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  puesto?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  /** Si se omite o va vacío, no se cambia el PIN. */
  @IsOptional()
  @ValidateIf((_, v) => typeof v === 'string' && v.length > 0)
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'El PIN debe ser exactamente 4 dígitos numéricos.',
  })
  pin?: string;
}
