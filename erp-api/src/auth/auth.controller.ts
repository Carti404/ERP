import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtValidatedUser } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.pin);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    /** F0: sin blacklist Redis; el cliente descarta el token (MVP M8.1 paso 4). */
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtValidatedUser) {
    const full = await this.usersService.findById(user.userId);
    if (!full || !full.activo) {
      return null;
    }
    return this.usersService.toPublic(full);
  }
}
