import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRole } from '../../common/enums/user-role.enum';
import { AccessTokenPayload } from '../auth.service';

export interface JwtValidatedUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: AccessTokenPayload): JwtValidatedUser {
    if (!payload?.sub || payload.typ !== 'access') {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, role: payload.role };
  }
}
