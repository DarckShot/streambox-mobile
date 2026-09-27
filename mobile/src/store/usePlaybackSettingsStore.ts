import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const storage = createAsyncStorage('streamboxPlaybackSettings');
const KEY = 'autoPlayOnResume';
let loading: Promise<void> | null = null;

interface PlaybackSettingsState {
  autoPlayOnResume: boolean;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setAutoPlayOnResume: (enabled: boolean) => Promise<void>;
}

export const usePlaybackSettingsStore = create<PlaybackSettingsState>()((set, get) => ({
  autoPlayOnResume: true,
  loaded: false,
  loadSettings: (): Promise<void> => {
    if (get().loaded) return Promise.resolve();
    if (loading) return loading;
    loading = storage
      .getItem(KEY)
      .then((value) => set({ autoPlayOnResume: value !== 'false', loaded: true }))
      .catch((error: unknown) => {
        console.warn('Не удалось загрузить настройки воспроизведения.', error);
        set({ loaded: true });
      })
      .finally(() => {
        loading = null;
      });
    return loading;
  },
  setAutoPlayOnResume: async (enabled): Promise<void> => {
    const previous = get().autoPlayOnResume;
    set({ autoPlayOnResume: enabled });
    try {
      await storage.setItem(KEY, String(enabled));
    } catch (error: unknown) {
      console.warn('Не удалось сохранить настройки воспроизведения.', error);
      set({ autoPlayOnResume: previous });
    }
  },
}));
