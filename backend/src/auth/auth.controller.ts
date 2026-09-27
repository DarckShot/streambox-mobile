import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';

import { AccessGuard } from './access.guard';
import { AuthService } from './auth.service';
import type { AuthRequest } from './auth.types';
import { CredentialsDto } from './dto/credentials.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: CredentialsDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: CredentialsDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.auth.login(body.email, body.password);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: RefreshDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  logout(@Req() request: AuthRequest): Promise<void> {
    return this.auth.logout(request.auth.sessionId, request.auth.userId);
  }
}
