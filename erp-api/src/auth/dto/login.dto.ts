import { IsString, Matches } from 'class-validator';

export class LoginDto {
  /** PIN de 4 dígitos; el usuario se infiere por coincidencia única entre trabajadores activos. */
  @IsString()
  @Matches(/^\d{4}$/, { message: 'pin debe ser exactamente 4 dígitos' })
  pin: string;
}
