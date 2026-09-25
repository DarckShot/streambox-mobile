import axios from 'axios';

import type { RutubePlayOptionsResponse } from '../types/rutube';

const RUTUBE_PLAY_OPTIONS_URL = 'https://rutube.ru/api/play/options';

export const getRutubePlaybackUrl = async (
  externalId: string,
  signal?: AbortSignal,
): Promise<string> => {
  let data: RutubePlayOptionsResponse;

  try {
    const response = await axios.get<RutubePlayOptionsResponse>(
      `${RUTUBE_PLAY_OPTIONS_URL}/${encodeURIComponent(externalId)}`,
      {
        headers: {
          Accept: 'application/json',
        },
        signal,
      },
    );
    data = response.data;
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.response) {
      throw new Error(`RUTUBE вернул ошибку ${error.response.status}.`);
    }

    throw new Error(`Ошибка сети: ${error.message}`);
  }

  if (!data.acl_access.allowed) {
    throw new Error(data.acl_access.err_text ?? 'Видео недоступно для воспроизведения.');
  }

  const playbackUrl = data.video_balancer?.m3u8 ?? data.video_balancer?.default;

  if (!playbackUrl) {
    throw new Error('RUTUBE не вернул ссылку на видеопоток.');
  }

  return playbackUrl;
};
