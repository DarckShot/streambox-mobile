import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { useVideoProgress } from '../src/hooks/useVideoProgress';
import { loadVideoProgress } from '../src/storage/videoProgress';

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const storage = createAsyncStorage('streamboxPlaybackProgress');

it('сохраняет прогресс периодически, при выходе и сбрасывает после завершения', async () => {
  await storage.clear();
  let current!: ReturnType<typeof useVideoProgress>;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    current = useVideoProgress('first', true);
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
    await Promise.resolve();
  });

  expect(current.saved.loaded).toBe(true);

  current.actions.setDuration(120);
  current.actions.recordProgress(10);
  expect(await loadVideoProgress('first')).toBe(10);

  current.actions.recordProgress(20);
  expect(await loadVideoProgress('first')).toBe(10);

  current.actions.flush();
  expect(await loadVideoProgress('first')).toBe(20);

  await ReactTestRenderer.act(() => {
    current.actions.complete();
  });
  current.actions.recordProgress(25);
  expect(await loadVideoProgress('first')).toBeNull();

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  expect(await loadVideoProgress('first')).toBeNull();
});

it('после повтора не восстанавливает позицию из завершённого воспроизведения', async () => {
  await storage.clear();
  let current!: ReturnType<typeof useVideoProgress>;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    current = useVideoProgress('first', true);
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
    await Promise.resolve();
  });

  current.actions.setDuration(120);
  current.actions.recordProgress(119);
  await ReactTestRenderer.act(() => {
    current.actions.complete();
    current.actions.beginReplay();
  });
  current.actions.recordProgress(120);
  expect(await loadVideoProgress('first')).toBeNull();

  current.actions.recordProgress(1);
  expect(await loadVideoProgress('first')).toBe(1);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

it('сохраняет последнее время при уходе с Player между периодическими записями', async () => {
  await storage.clear();
  let current!: ReturnType<typeof useVideoProgress>;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    current = useVideoProgress('first', true);
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
    await Promise.resolve();
  });

  current.actions.setDuration(120);
  current.actions.recordProgress(10);
  current.actions.recordProgress(12);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });

  expect(await loadVideoProgress('first')).toBe(12);
});
