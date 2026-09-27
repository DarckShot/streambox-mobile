import { apiClient } from '../src/api/client';
import { getVideo, getVideoPlaybackUrl, getVideos, importVideo } from '../src/api/videos';
import { API_BASE_URL } from '../src/config/apiConfig';

const serverVideo = {
  id: 'rutube-abcdef',
  externalId: 'abcdef',
  title: 'Видео',
  description: null,
  thumbnailUrl: null,
  duration: 125,
  category: null,
  author: null,
  sourceUrl: 'https://rutube.ru/video/abcdef/',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lastSyncedAt: '2026-01-01T00:00:00.000Z',
};

afterEach(() => jest.restoreAllMocks());

it('читает серверный каталог и заполняет только необязательные поля для UI', async () => {
  const request = jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [serverVideo] });
  const videos = await getVideos(' Видео ');
  expect(request).toHaveBeenCalledWith(
    '/videos',
    expect.objectContaining({ params: { search: ' Видео ' } }),
  );
  expect(videos[0]).toMatchObject({
    id: 'rutube-abcdef',
    duration: '2:05',
    thumbnailUrl: '',
    category: 'Без категории',
  });
});

it('отклоняет повреждённый ответ backend и неверный playback URL', async () => {
  jest
    .spyOn(apiClient, 'get')
    .mockResolvedValueOnce({ data: [{ id: 'bad' }] })
    .mockResolvedValueOnce({ data: { url: 'not-url' } });
  await expect(getVideos()).rejects.toMatchObject({ kind: 'invalid-response' });
  await expect(getVideoPlaybackUrl('video-001')).rejects.toMatchObject({
    kind: 'invalid-response',
  });
});

it('передаёт 404 и сохраняет серверный ID при импорте', async () => {
  jest
    .spyOn(apiClient, 'get')
    .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
  await expect(getVideo('missing')).rejects.toMatchObject({ kind: 'not-found', status: 404 });
  jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: serverVideo });
  expect((await importVideo('abcdef')).id).toBe('rutube-abcdef');
});

it('загружает обложку через backend, не обращаясь к CDN из приложения', async () => {
  jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
    data: [{ ...serverVideo, thumbnailUrl: 'https://pic.rtbcdn.ru/image.jpg' }],
  });
  expect((await getVideos())[0].thumbnailUrl).toBe(
    `${API_BASE_URL}/videos/rutube-abcdef/thumbnail`,
  );
});
