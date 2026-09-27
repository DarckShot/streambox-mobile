import { apiClient } from '../src/api/client';
import { getVideoProgress, saveProgress } from '../src/api/me';

afterEach(() => jest.restoreAllMocks());

it('считает пустой ответ backend отсутствующим прогрессом', async () => {
  jest.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: '' });
  jest.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: '' });

  await expect(getVideoProgress('video-001')).resolves.toBeNull();
  await expect(saveProgress('video-001', 60, 60)).resolves.toBeNull();
});
