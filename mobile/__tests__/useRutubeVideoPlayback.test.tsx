import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import type { OnLoadData, OnProgressData } from 'react-native-video';

import { useRutubeVideoPlayback } from '../src/hooks/useRutubeVideoPlayback';
import { userKeys } from '../src/api/userQueries';
import { usePlaybackSettingsStore } from '../src/store/usePlaybackSettingsStore';
import { recordWatch } from '../src/api/me';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  usePreventRemove: () => undefined,
}));

jest.mock('../src/api/videos', () => ({
  getVideoPlaybackUrl: jest.fn(async () => 'https://example.com/video.m3u8'),
}));

const mockPositions = new Map<string, number>();
jest.mock('../src/api/me', () => ({
  getCurrentUser: jest.fn(async () => ({ id: 'user-1', email: 'test@example.com' })),
  getVideoProgress: jest.fn(async (videoId: string) =>
    mockPositions.has(videoId)
      ? {
          videoId,
          positionSeconds: mockPositions.get(videoId),
          durationSeconds: 120,
          updatedAt: new Date().toISOString(),
        }
      : null,
  ),
  saveProgress: jest.fn(async (videoId: string, positionSeconds: number) => {
    mockPositions.set(videoId, positionSeconds);
    return null;
  }),
  removeProgress: jest.fn(async (videoId: string) => {
    mockPositions.delete(videoId);
  }),
  recordWatch: jest.fn(async () => undefined),
}));
const client = (): QueryClient => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  queryClient.setQueryData(userKeys.me, { id: 'user-1', email: 'test@example.com' });
  return queryClient;
};

it('при повторном открытии передаёт сохранённую позицию нативному плееру до загрузки видео', async () => {
  mockPositions.clear();
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    playback = useRutubeVideoPlayback({ videoId: 'video-a' });
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });

  expect(playback.mediaReady).toBe(true);
  expect(playback.source.startPosition).toBe(0);

  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 120, currentTime: 0 } as OnLoadData);
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 42 } as OnProgressData);
  });

  expect(mockPositions.get('video-a')).toBe(42);

  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 48 } as OnProgressData);
  });
  expect(mockPositions.get('video-a')).toBe(42);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
  expect(mockPositions.get('video-a')).toBe(48);

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });

  expect(playback.mediaReady).toBe(true);
  expect(playback.source.startPosition).toBe(48000);

  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 120, currentTime: 48 } as OnLoadData);
  });

  expect(playback.player.currentTime).toBe(48);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

it('сохраняет позицию потока, который не сообщил длительность', async () => {
  mockPositions.clear();
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    playback = useRutubeVideoPlayback({ videoId: 'video-b' });
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });

  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 0, currentTime: 0 } as OnLoadData);
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 18 } as OnProgressData);
  });

  expect(mockPositions.get('video-b')).toBe(18);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });

  expect(playback.source.startPosition).toBe(18000);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

it('запускает Player по прямой ссылке после загрузки видео', async () => {
  jest.clearAllMocks();
  mockPositions.clear();
  usePlaybackSettingsStore.setState({ loaded: true, autoPlayOnResume: false });
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const Probe = (): null => {
    playback = useRutubeVideoPlayback({
      videoId: 'video-c',
      autoPlayOnOpen: true,
    });
    return null;
  };
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 90, currentTime: 0 } as OnLoadData);
  });
  expect(playback.player.hasStarted).toBe(true);
  expect(playback.player.isPaused).toBe(false);
  await ReactTestRenderer.act(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
  });
  expect(recordWatch).toHaveBeenCalledWith('video-c', undefined, false);
  await ReactTestRenderer.act(() => renderer.unmount());
});

it('добавляет видео в историю сразу после начала просмотра, до первого onProgress', async () => {
  jest.clearAllMocks();
  mockPositions.clear();
  usePlaybackSettingsStore.setState({ loaded: true, autoPlayOnResume: false });
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const Probe = (): null => {
    playback = useRutubeVideoPlayback({ videoId: 'video-short' });
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client()}>
        <Probe />
      </QueryClientProvider>,
    );
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 90, currentTime: 0 } as OnLoadData);
  });
  await ReactTestRenderer.act(async () => {
    playback.handlers.onPlaybackPress();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
  });

  expect(recordWatch).toHaveBeenCalledWith('video-short', undefined, false);
  await ReactTestRenderer.act(() => renderer.unmount());
});
