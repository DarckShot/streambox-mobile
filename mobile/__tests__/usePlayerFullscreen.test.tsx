import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Platform, useWindowDimensions } from 'react-native';

import { usePlayerFullscreen } from '../src/hooks/usePlayerFullscreen';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  useWindowDimensions: jest.fn(),
}));

const mockUseWindowDimensions = jest.mocked(useWindowDimensions);

type FullscreenResult = ReturnType<typeof usePlayerFullscreen>;

describe('usePlayerFullscreen', () => {
  let current: FullscreenResult;

  const Probe = ({ currentTime }: { currentTime: number }): null => {
    current = usePlayerFullscreen(currentTime, true);
    return null;
  };

  beforeEach(() => {
    (Platform as { OS: string }).OS = 'ios';
    mockUseWindowDimensions.mockReturnValue({ width: 390, height: 844, scale: 1, fontScale: 1 });
  });

  it('сохраняет позицию при входе и выходе и блокирует повторный вход до закрытия', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe currentTime={42.25} />);
    });

    await ReactTestRenderer.act(() => {
      current.actions.toggle();
    });

    expect(current.state).toMatchObject({
      mounted: true,
      visible: true,
      modalStartPosition: 42250,
    });
    expect(current.actions.consumeRestorePosition()).toBe(42.25);

    await ReactTestRenderer.act(() => {
      renderer.update(<Probe currentTime={52.5} />);
    });

    await ReactTestRenderer.act(() => {
      current.actions.close();
    });

    expect(current.state.visible).toBe(false);
    expect(current.state.inlineStartPosition).toBe(52500);
    expect(current.actions.consumeRestorePosition()).toBe(52.5);

    if (Platform.OS === 'ios') {
      await ReactTestRenderer.act(() => {
        current.actions.toggle();
      });

      expect(current.state.visible).toBe(false);
    }

    await ReactTestRenderer.act(() => {
      current.actions.resetStartPosition();
    });

    expect(current.state).toMatchObject({ inlineStartPosition: 0, modalStartPosition: 0 });
    expect(current.actions.consumeRestorePosition()).toBeNull();

    await ReactTestRenderer.act(() => {
      current.actions.handleDismiss();
      renderer.unmount();
    });
  });

  it('после ручного выхода в landscape не открывается снова до поворота через portrait', async () => {
    (Platform as { OS: string }).OS = 'android';
    mockUseWindowDimensions.mockReturnValue({ width: 844, height: 390, scale: 1, fontScale: 1 });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe currentTime={10} />);
    });

    expect(current.state.visible).toBe(true);

    await ReactTestRenderer.act(() => {
      current.actions.close();
    });

    expect(current.state).toMatchObject({ mounted: false, visible: false });

    await ReactTestRenderer.act(() => {
      renderer.update(<Probe currentTime={11} />);
    });

    expect(current.state.visible).toBe(false);

    mockUseWindowDimensions.mockReturnValue({ width: 390, height: 844, scale: 1, fontScale: 1 });
    await ReactTestRenderer.act(() => {
      renderer.update(<Probe currentTime={12} />);
    });

    mockUseWindowDimensions.mockReturnValue({ width: 844, height: 390, scale: 1, fontScale: 1 });
    await ReactTestRenderer.act(() => {
      renderer.update(<Probe currentTime={13} />);
    });

    expect(current.state).toMatchObject({ mounted: true, visible: true });

    await ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
});
