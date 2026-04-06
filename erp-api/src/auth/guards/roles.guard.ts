import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../common/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtValidatedUser } from '../strategies/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }
    const req = context
      .switchToHttp()
      .getRequest<{ user?: JwtValidatedUser }>();
    const user = req.user;
    if (!user) {
      return false;
    }
    return required.includes(user.role);
  }
}
