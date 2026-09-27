import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoryDto } from './dto/history.dto';
import { ProgressDto } from './dto/progress.dto';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireVideo(videoId: string): Promise<void> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });
    if (!video) throw new NotFoundException('Видео не найдено.');
  }

  favorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { videoId: true, createdAt: true },
    });
  }

  async addFavorite(userId: string, videoId: string) {
    await this.requireVideo(videoId);
    return this.prisma.favorite.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: { userId, videoId },
      update: {},
      select: { videoId: true, createdAt: true },
    });
  }

  async removeFavorite(userId: string, videoId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, videoId } });
  }

  history(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: 'desc' },
      select: { videoId: true, lastWatchedAt: true, completed: true },
    });
  }

  async recordWatch(userId: string, videoId: string, body: HistoryDto) {
    await this.requireVideo(videoId);
    const watchedAt = body.watchedAt ? new Date(body.watchedAt) : new Date();
    if (watchedAt.getTime() > Date.now() + 60_000)
      throw new BadRequestException('Некорректная дата просмотра.');
    const key = { userId_videoId: { userId, videoId } };
    const previous = await this.prisma.watchHistory.findUnique({ where: key });
    if (previous && previous.lastWatchedAt >= watchedAt) return previous;
    return this.prisma.watchHistory.upsert({
      where: key,
      create: { userId, videoId, lastWatchedAt: watchedAt, completed: body.completed ?? false },
      update: { lastWatchedAt: watchedAt, completed: body.completed ?? false },
    });
  }

  async removeHistory(userId: string, videoId: string): Promise<void> {
    await this.prisma.watchHistory.deleteMany({ where: { userId, videoId } });
  }

  async clearHistory(userId: string): Promise<void> {
    await this.prisma.watchHistory.deleteMany({ where: { userId } });
  }

  progress(userId: string) {
    return this.prisma.playbackProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { videoId: true, positionSeconds: true, durationSeconds: true, updatedAt: true },
    });
  }

  async progressForVideo(userId: string, videoId: string) {
    return this.prisma.playbackProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { videoId: true, positionSeconds: true, durationSeconds: true, updatedAt: true },
    });
  }

  async saveProgress(userId: string, videoId: string, body: ProgressDto) {
    await this.requireVideo(videoId);
    if (body.durationSeconds > 0 && body.positionSeconds > body.durationSeconds + 5)
      throw new BadRequestException('Позиция выходит за пределы видео.');
    const key = { userId_videoId: { userId, videoId } };
    const previous = await this.prisma.playbackProgress.findUnique({ where: key });
    const observedAt = body.observedAt ? new Date(body.observedAt) : new Date();
    if (observedAt.getTime() > Date.now() + 60_000)
      throw new BadRequestException('Некорректная дата прогресса.');
    if (previous && body.observedAt && previous.updatedAt >= observedAt) return previous;
    if (
      body.positionSeconds <= 0 ||
      (body.durationSeconds > 0 && body.positionSeconds >= body.durationSeconds - 1)
    ) {
      await this.prisma.playbackProgress.deleteMany({ where: { userId, videoId } });
      return null;
    }
    return this.prisma.playbackProgress.upsert({
      where: key,
      create: {
        userId,
        videoId,
        positionSeconds: body.positionSeconds,
        durationSeconds: body.durationSeconds,
      },
      update: { positionSeconds: body.positionSeconds, durationSeconds: body.durationSeconds },
    });
  }

  async removeProgress(userId: string, videoId: string): Promise<void> {
    await this.prisma.playbackProgress.deleteMany({ where: { userId, videoId } });
  }

  async clearProgress(userId: string): Promise<void> {
    await this.prisma.playbackProgress.deleteMany({ where: { userId } });
  }

  async clearFavorites(userId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId } });
  }
}
