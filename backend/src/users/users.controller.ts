import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AccessGuard } from '../auth/access.guard';
import type { AuthRequest } from '../auth/auth.types';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AccessGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() request: AuthRequest): ReturnType<UsersService['me']> {
    return this.users.me(request.auth.userId);
  }
}
