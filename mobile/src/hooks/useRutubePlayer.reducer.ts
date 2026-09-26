import type { BasicVideoPlayerStatus } from '../types/player';
import { clampPlaybackTime } from '../utils/clampPlaybackTime';

export interface RutubePlayerState {
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  hasStarted: boolean;
  isMuted: boolean;
  isPaused: boolean;
  mediaKey: number;
  playbackUrl: string | null;
  reloadKey: number;
  status: BasicVideoPlayerStatus;
}

export type RutubePlayerAction =
  | { type: 'loadRequested' }
  | { type: 'loadSucceeded'; playbackUrl: string }
  | { type: 'loadFailed'; errorMessage: string }
  | { type: 'playbackPressed' }
  | { type: 'mediaLoaded'; currentTime: number; duration: number }
  | { type: 'progressChanged'; currentTime: number }
  | { type: 'bufferChanged'; isBuffering: boolean }
  | { type: 'playbackEnded' }
  | { type: 'seekRequested'; currentTime: number }
  | { type: 'mutePressed' }
  | { type: 'playbackFailed'; errorMessage: string }
  | { type: 'retryPressed' }
  | { type: 'deactivated' };

export const INITIAL_RUTUBE_PLAYER_STATE: RutubePlayerState = {
  currentTime: 0,
  duration: 0,
  errorMessage: null,
  hasStarted: false,
  isMuted: false,
  isPaused: true,
  mediaKey: 0,
  playbackUrl: null,
  reloadKey: 0,
  status: 'loading',
};

export const rutubePlayerReducer = (
  state: RutubePlayerState,
  action: RutubePlayerAction,
): RutubePlayerState => {
  switch (action.type) {
    case 'loadRequested':
      return {
        ...state,
        currentTime: 0,
        duration: 0,
        errorMessage: null,
        hasStarted: false,
        isPaused: true,
        playbackUrl: null,
        status: 'loading',
      };

    case 'loadSucceeded':
      return {
        ...state,
        playbackUrl: action.playbackUrl,
        status: 'idle',
      };

    case 'loadFailed':
      return {
        ...state,
        errorMessage: action.errorMessage,
        status: 'error',
      };

    case 'playbackPressed':
      if (!state.playbackUrl) {
        return state;
      }

      if (state.status === 'playing' || state.status === 'buffering') {
        return {
          ...state,
          isPaused: true,
          status: 'paused',
        };
      }

      return {
        ...state,
        hasStarted: true,
        isPaused: false,
        mediaKey: state.status === 'ended' ? state.mediaKey + 1 : state.mediaKey,
        status: state.status === 'ended' ? 'loading' : 'playing',
      };

    case 'mediaLoaded':
      return {
        ...state,
        currentTime: clampPlaybackTime(action.currentTime, action.duration),
        duration: action.duration,
        status: state.isPaused ? 'idle' : 'playing',
      };

    case 'progressChanged':
      return {
        ...state,
        currentTime: clampPlaybackTime(action.currentTime, state.duration),
      };

    case 'bufferChanged':
      if (state.isPaused) {
        return state;
      }

      return {
        ...state,
        status: action.isBuffering ? 'buffering' : 'playing',
      };

    case 'playbackEnded':
      return {
        ...state,
        currentTime: state.duration,
        isPaused: true,
        status: 'ended',
      };

    case 'seekRequested': {
      const nextTime = clampPlaybackTime(action.currentTime, state.duration);

      return {
        ...state,
        currentTime: nextTime,
        status: state.status === 'ended' && nextTime < state.duration ? 'paused' : state.status,
      };
    }

    case 'mutePressed':
      return {
        ...state,
        isMuted: !state.isMuted,
      };

    case 'playbackFailed':
      return {
        ...state,
        errorMessage: action.errorMessage,
        hasStarted: false,
        isPaused: true,
        status: 'error',
      };

    case 'retryPressed':
      return {
        ...state,
        currentTime: 0,
        duration: 0,
        errorMessage: null,
        hasStarted: false,
        isPaused: true,
        mediaKey: state.mediaKey + 1,
        playbackUrl: null,
        reloadKey: state.reloadKey + 1,
        status: 'loading',
      };

    case 'deactivated':
      return {
        ...state,
        isPaused: true,
        status:
          state.status === 'playing' || state.status === 'buffering' ? 'paused' : state.status,
      };
  }
};
