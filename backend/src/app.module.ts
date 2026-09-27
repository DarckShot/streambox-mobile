import { Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { RutubeService } from './rutube/rutube.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';

@Module({
  controllers: [VideosController],
  providers: [PrismaService, RutubeService, VideosService],
})
export class AppModule {}
