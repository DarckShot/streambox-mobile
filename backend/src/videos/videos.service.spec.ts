import { NotFoundException } from '@nestjs/common';

import { VideosService } from './videos.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { RutubeService } from '../rutube/rutube.service';

const externalId = 'f0ca53a0f70c1d02543a6939abf988cc';
const metadata = {
  externalId, title: 'Космос', description: null, thumbnailUrl: null,
  duration: 60, category: null, author: null, sourceUrl: `https://rutube.ru/video/${externalId}/`,
};
const video = { ...metadata, id: 'video-001', searchTitle: 'космос', createdAt: new Date(), updatedAt: new Date(), lastSyncedAt: new Date() };

it('импортирует известный ID, обновляет запись и ищет без учёта регистра и пробелов', async () => {
  const findMany = jest.fn().mockResolvedValue([video]);
  const upsert = jest.fn().mockResolvedValue(video);
  const prisma = { video: { findMany, upsert } } as unknown as PrismaService;
  const rutube = { extractExternalId: jest.fn().mockReturnValue(externalId), getMetadata: jest.fn().mockResolvedValue(metadata) } as unknown as RutubeService;
  const service = new VideosService(prisma, rutube);
  expect((await service.import(externalId)).id).toBe('video-001');
  expect(upsert.mock.calls[0][0]).toMatchObject({ where: { externalId }, create: { id: 'video-001', searchTitle: 'космос' }, update: { searchTitle: 'космос' } });
  await service.list('  КОСМОС  ');
  expect(findMany.mock.calls[0][0]).toMatchObject({ where: { searchTitle: { contains: 'космос' } } });
});

it('отдаёт 404 для неизвестного ID без обращения к RUTUBE', async () => {
  const prisma = { video: { findUnique: jest.fn().mockResolvedValue(null) } } as unknown as PrismaService;
  const rutube = { getPlaybackUrl: jest.fn() } as unknown as RutubeService;
  const service = new VideosService(prisma, rutube);
  await expect(service.get('unknown')).rejects.toThrow(NotFoundException);
  await expect(service.playback('unknown')).rejects.toThrow(NotFoundException);
  expect(rutube.getPlaybackUrl).not.toHaveBeenCalled();
});
