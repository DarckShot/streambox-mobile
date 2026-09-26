import {
  INITIAL_RUTUBE_PLAYER_STATE,
  rutubePlayerReducer,
  type RutubePlayerState,
} from '../src/hooks/useRutubePlayer.reducer';

const createReadyState = (overrides: Partial<RutubePlayerState> = {}): RutubePlayerState => ({
  ...INITIAL_RUTUBE_PLAYER_STATE,
  duration: 120,
  playbackUrl: 'https://example.com/video.m3u8',
  status: 'paused',
  ...overrides,
});

describe('rutubePlayerReducer', () => {
  it('ограничивает перемотку границами видео', () => {
    const state = createReadyState({ currentTime: 5 });
    const beforeStart = rutubePlayerReducer(state, {
      type: 'seekRequested',
      currentTime: -5,
    });
    const afterEnd = rutubePlayerReducer(state, {
      type: 'seekRequested',
      currentTime: 130,
    });

    expect(beforeStart.currentTime).toBe(0);
    expect(afterEnd.currentTime).toBe(120);
  });

  it('возвращает ended-плеер в paused после перемотки назад', () => {
    const endedState = rutubePlayerReducer(
      createReadyState({ currentTime: 118, isPaused: false, status: 'playing' }),
      { type: 'playbackEnded' },
    );
    const rewoundState = rutubePlayerReducer(endedState, {
      type: 'seekRequested',
      currentTime: 110,
    });

    expect(endedState).toMatchObject({ currentTime: 120, isPaused: true, status: 'ended' });
    expect(rewoundState).toMatchObject({ currentTime: 110, isPaused: true, status: 'paused' });
  });

  it('позволяет поставить видео на паузу во время buffering', () => {
    const bufferingState = rutubePlayerReducer(
      createReadyState({ hasStarted: true, isPaused: false, status: 'playing' }),
      { type: 'bufferChanged', isBuffering: true },
    );
    const pausedState = rutubePlayerReducer(bufferingState, { type: 'playbackPressed' });

    expect(bufferingState.status).toBe('buffering');
    expect(pausedState).toMatchObject({ isPaused: true, status: 'paused' });
  });
});
