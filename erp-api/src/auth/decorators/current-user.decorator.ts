import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtValidatedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtValidatedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: JwtValidatedUser }>();
    return req.user;
  },
);
