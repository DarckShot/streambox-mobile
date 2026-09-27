import { Injectable, NotFoundException } from '@nestjs/common';
import type { Video } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { RutubeService } from '../rutube/rutube.service';
import { LEGACY_VIDEO_IDS } from './legacy-video-ids';

export type VideoResponse = Omit<Video, 'searchTitle'>;
const toResponse = ({ searchTitle: _searchTitle, ...video }: Video): VideoResponse => video;

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rutube: RutubeService,
  ) {}

  async list(search?: string): Promise<VideoResponse[]> {
    const query = search?.trim().toLocaleLowerCase('ru-RU');
    const videos = await this.prisma.video.findMany({
      where: query ? { searchTitle: { contains: query } } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return videos.map(toResponse);
  }

  async get(id: string): Promise<VideoResponse> {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Видео не найдено.');
    return toResponse(video);
  }

  async import(input: string): Promise<VideoResponse> {
    const externalId = this.rutube.extractExternalId(input);
    return this.upsertFromRutube(externalId);
  }

  async sync(id: string): Promise<VideoResponse> {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Видео не найдено.');
    return this.upsertFromRutube(video.externalId);
  }

  async playback(id: string): Promise<{ url: string }> {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Видео не найдено.');
    return { url: await this.rutube.getPlaybackUrl(video.externalId) };
  }

  async thumbnail(id: string): Promise<{ bytes: Buffer; contentType: string }> {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video?.thumbnailUrl) throw new NotFoundException('Обложка видео не найдена.');
    return this.rutube.getThumbnail(video.thumbnailUrl);
  }

  private async upsertFromRutube(externalId: string): Promise<VideoResponse> {
    const metadata = await this.rutube.getMetadata(externalId);
    const now = new Date();
    const { externalId: _, ...fields } = metadata;
    const video = await this.prisma.video.upsert({
      where: { externalId },
      create: {
        id: LEGACY_VIDEO_IDS[externalId] ?? `rutube-${externalId}`,
        externalId,
        ...fields,
        searchTitle: metadata.title.toLocaleLowerCase('ru-RU'),
        lastSyncedAt: now,
      },
      update: {
        ...fields,
        searchTitle: metadata.title.toLocaleLowerCase('ru-RU'),
        lastSyncedAt: now,
      },
    });
    return toResponse(video);
  }
}
