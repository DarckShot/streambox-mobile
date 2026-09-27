import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(
    userId: string,
  ): Promise<{ id: string; email: string; createdAt: Date; updatedAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден.');
    return user;
  }
}
