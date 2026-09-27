import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { RutubeService } from './rutube/rutube.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MeModule],
  controllers: [VideosController],
  providers: [RutubeService, VideosService],
})
export class AppModule {}
