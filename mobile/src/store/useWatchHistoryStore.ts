import { create } from 'zustand';

import { isValidVideoId } from '../utils/isValidVideoId';
import {
  loadWatchHistory,
  saveWatchHistory,
  type WatchHistoryEntry,
} from '../storage/watchHistory';

interface WatchHistoryState {
  entries: WatchHistoryEntry[];
  error: string | null;
  loaded: boolean;
  loadHistory: () => Promise<void>;
  recordWatch: (videoId: string, position: number, duration: number) => void;
  clearHistory: () => void;
}

let loading: Promise<void> | null = null;

const reportSaveError = (error: unknown): void => {
  console.warn('Не удалось сохранить историю просмотра.', error);
  useWatchHistoryStore.setState({ error: 'Не удалось сохранить историю просмотра.' });
};

export const useWatchHistoryStore = create<WatchHistoryState>()((set, get) => ({
  entries: [],
  error: null,
  loaded: false,

  loadHistory: (): Promise<void> => {
    if (get().loaded) return Promise.resolve();
    if (loading) return loading;
    loading = loadWatchHistory()
      .then((entries) => set({ entries, loaded: true, error: null }))
      .catch((error: unknown) => {
        console.warn('Не удалось загрузить историю просмотра.', error);
        set({ loaded: true, error: 'Не удалось загрузить историю просмотра.' });
      })
      .finally(() => {
        loading = null;
      });
    return loading;
  },

  recordWatch: (videoId, position, duration): void => {
    if (
      !isValidVideoId(videoId) ||
      !Number.isFinite(position) ||
      position < 0 ||
      !Number.isFinite(duration) ||
      duration < 0
    )
      return;
    if (!get().loaded) {
      get()
        .loadHistory()
        .then(() => get().recordWatch(videoId, position, duration));
      return;
    }
    const entry: WatchHistoryEntry = { videoId, position, duration, lastWatchedAt: Date.now() };
    const entries = [entry, ...get().entries.filter((item) => item.videoId !== videoId)];
    set({ entries, error: null });
    saveWatchHistory(entries).catch(reportSaveError);
  },

  clearHistory: (): void => {
    if (!get().loaded) {
      get()
        .loadHistory()
        .then(() => get().clearHistory());
      return;
    }
    set({ entries: [], error: null });
    saveWatchHistory([]).catch(reportSaveError);
  },
}));
