import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useInitialPlaybackResume } from '../src/hooks/useInitialPlaybackResume';

it('восстанавливает позицию один раз после загрузки медиа и возвращения фокуса', async () => {
  const onRestore = jest.fn();
  const onDiscard = jest.fn();
  let current!: ReturnType<typeof useInitialPlaybackResume>;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = ({ focused }: { focused: boolean }): null => {
    current = useInitialPlaybackResume({
      isFocused: focused,
      onDiscard,
      onRestore,
      saved: { loaded: true, position: 42 },
    });
    return null;
  };

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe focused={false} />);
  });

  await ReactTestRenderer.act(() => {
    current.recordMediaLoad(120);
  });

  expect(current.ready).toBe(false);
  expect(onRestore).not.toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    renderer.update(<Probe focused />);
  });

  expect(current.ready).toBe(true);
  expect(onRestore).toHaveBeenCalledTimes(1);
  expect(onRestore).toHaveBeenCalledWith(42);
  expect(onDiscard).not.toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    current.recordMediaLoad(120);
    renderer.update(<Probe focused />);
  });

  expect(onRestore).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});

it('отбрасывает позицию у самого конца видео', async () => {
  const onRestore = jest.fn();
  const onDiscard = jest.fn();
  let current!: ReturnType<typeof useInitialPlaybackResume>;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  const Probe = (): null => {
    current = useInitialPlaybackResume({
      isFocused: true,
      onDiscard,
      onRestore,
      saved: { loaded: true, position: 119.5 },
    });
    return null;
  };

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe />);
  });

  await ReactTestRenderer.act(() => {
    current.recordMediaLoad(120);
  });

  expect(current.ready).toBe(true);
  expect(onDiscard).toHaveBeenCalledTimes(1);
  expect(onRestore).not.toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
