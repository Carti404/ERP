import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  typ: 'access';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(pin: string) {
    const user = await this.usersService.findActiveUserByUniquePin(pin);
    if (!user) {
      throw new UnauthorizedException('credenciales inválidas');
    }
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      typ: 'access',
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = parseInt(
      String(this.config.get('JWT_EXPIRES_SEC', 3600)),
      10,
    );
    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        role: user.role,
        displayName: user.fullName,
        username: user.username,
      },
    };
  }
}
