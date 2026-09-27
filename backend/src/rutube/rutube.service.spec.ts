import { BadRequestException, GatewayTimeoutException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import { RutubeService } from './rutube.service';

const ID = 'f0ca53a0f70c1d02543a6939abf988cc';
const rutube = new RutubeService();

afterEach(() => jest.restoreAllMocks());

it('принимает только ID и ссылки видео с rutube.ru', () => {
  expect(rutube.extractExternalId(ID)).toBe(ID);
  expect(rutube.extractExternalId(`https://rutube.ru/video/${ID}/?ref=app`)).toBe(ID);
  expect(() => rutube.extractExternalId(`https://evil.example/video/${ID}`)).toThrow(BadRequestException);
  expect(() => rutube.extractExternalId('bad id')).toThrow(BadRequestException);
});

it('нормализует метаданные и не переносит сырые поля', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      id: ID, title: '  Космос  ', description: null, thumbnail_url: 'https://pic.rtbcdn.ru/a.jpg',
      duration: 62.4, category: { name: 'Наука' }, author: { name: 'Автор' }, secret: 'raw',
    }),
  } as Response);
  expect(await rutube.getMetadata(ID)).toEqual({
    externalId: ID, title: 'Космос', description: null,
    thumbnailUrl: 'https://pic.rtbcdn.ru/a.jpg', duration: 62,
    category: 'Наука', author: 'Автор', sourceUrl: `https://rutube.ru/video/${ID}/`,
  });
});

it('отличает удалённое видео, таймаут и временную сетевую ошибку', async () => {
  const request = jest.spyOn(global, 'fetch');
  request.mockResolvedValueOnce({ ok: false, status: 404 } as Response);
  await expect(rutube.getMetadata(ID)).rejects.toThrow(NotFoundException);
  request.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
  await expect(rutube.getMetadata(ID)).rejects.toThrow(GatewayTimeoutException);
  request.mockRejectedValueOnce(new Error('offline'));
  await expect(rutube.getMetadata(ID)).rejects.toThrow(ServiceUnavailableException);
});

it('возвращает временную ссылку только при разрешённом playback', async () => {
  const request = jest.spyOn(global, 'fetch');
  request.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ acl_access: { allowed: true }, video_balancer: { m3u8: 'https://bl.rutube.ru/stream.m3u8' } }) } as Response);
  await expect(rutube.getPlaybackUrl(ID)).resolves.toBe('https://bl.rutube.ru/stream.m3u8');
  request.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ acl_access: { allowed: false, err_text: 'Недоступно' } }) } as Response);
  await expect(rutube.getPlaybackUrl(ID)).rejects.toThrow(ServiceUnavailableException);
});

it('загружает обложку только с доверенного CDN RUTUBE', async () => {
  await expect(rutube.getThumbnail('https://example.com/image.jpg')).rejects.toThrow(NotFoundException);
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    headers: new Headers({ 'content-type': 'image/jpeg', 'content-length': '3' }),
    arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer,
  } as Response);
  await expect(rutube.getThumbnail('https://pic.rtbcdn.ru/image.jpg')).resolves.toMatchObject({
    bytes: Buffer.from([1, 2, 3]),
    contentType: 'image/jpeg',
  });
});
