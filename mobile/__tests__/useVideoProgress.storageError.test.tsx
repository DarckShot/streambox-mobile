import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useVideoProgress } from '../src/hooks/useVideoProgress';

jest.mock('../src/storage/videoProgress', () => ({
  clearVideoProgress: jest.fn(async () => undefined),
  loadVideoProgress: jest.fn(async () => {
    throw new Error('Native module is null');
  }),
  saveVideoProgress: jest.fn(async () => {
    throw new Error('Native module is null');
  }),
}));

it('сообщает об ошибке хранилища вместо тихой потери прогресса', async () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  let progress!: ReturnType<typeof useVideoProgress>;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    progress = useVideoProgress('video-a', true);
    return null;
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });

  expect(progress.saved.loaded).toBe(true);
  expect(progress.saved.position).toBeNull();
  expect(warning).toHaveBeenCalledWith(
    'Не удалось сохранить или загрузить позицию просмотра.',
    expect.objectContaining({ message: 'Native module is null' }),
  );

  progress.actions.setDuration(120);
  progress.actions.recordProgress(15);
  await Promise.resolve();
  expect(warning).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
  warning.mockRestore();
});
