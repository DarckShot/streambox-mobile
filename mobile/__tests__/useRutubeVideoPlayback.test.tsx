import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { OnLoadData, OnProgressData } from 'react-native-video';
import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { useRutubeVideoPlayback } from '../src/hooks/useRutubeVideoPlayback';
import { loadVideoProgress } from '../src/storage/videoProgress';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  usePreventRemove: () => undefined,
}));

jest.mock('../src/api/rutube', () => ({
  getRutubePlaybackUrl: jest.fn(async () => 'https://example.com/video.m3u8'),
}));

const storage = createAsyncStorage('streamboxPlaybackProgress');

it('при повторном открытии передаёт сохранённую позицию нативному плееру до загрузки видео', async () => {
  await storage.clear();
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    playback = useRutubeVideoPlayback({ externalId: 'external-a', videoId: 'video-a' });
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });

  expect(playback.mediaReady).toBe(true);
  expect(playback.source.startPosition).toBe(0);

  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 120, currentTime: 0 } as OnLoadData);
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 42 } as OnProgressData);
  });

  expect(await loadVideoProgress('video-a')).toBe(42);

  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 48 } as OnProgressData);
  });
  expect(await loadVideoProgress('video-a')).toBe(42);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  expect(await loadVideoProgress('video-a')).toBe(48);

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
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
  await storage.clear();
  let playback!: ReturnType<typeof useRutubeVideoPlayback>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    playback = useRutubeVideoPlayback({ externalId: 'external-b', videoId: 'video-b' });
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });

  await ReactTestRenderer.act(() => {
    playback.handlers.onLoad({ duration: 0, currentTime: 0 } as OnLoadData);
  });
  await ReactTestRenderer.act(() => {
    playback.handlers.onProgress({ currentTime: 18 } as OnProgressData);
  });

  expect(await loadVideoProgress('video-b')).toBe(18);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });

  expect(playback.source.startPosition).toBe(18000);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
