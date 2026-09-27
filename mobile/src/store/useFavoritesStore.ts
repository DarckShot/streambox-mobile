import { create } from 'zustand';

import { isKnownVideoId, loadFavoriteIds, saveFavoriteIds } from '../storage/favorites';

export type FavoritesStatus = 'idle' | 'loading' | 'ready' | 'error';

interface FavoritesState {
  error: string | null;
  favoriteIds: string[];
  isSaving: boolean;
  loadFavorites: () => Promise<void>;
  status: FavoritesStatus;
  toggleFavorite: (videoId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  error: null,
  favoriteIds: [],
  isSaving: false,
  status: 'idle',

  loadFavorites: async (): Promise<void> => {
    const status = get().status;

    if (status === 'loading' || status === 'ready') {
      return;
    }

    set({ error: null, status: 'loading' });

    try {
      const favoriteIds = await loadFavoriteIds();
      set({ favoriteIds, status: 'ready' });
    } catch (error: unknown) {
      console.warn('Не удалось загрузить избранное.', error);
      set({ error: 'Не удалось загрузить избранное. Попробуйте ещё раз.', status: 'error' });
    }
  },

  toggleFavorite: async (videoId: string): Promise<void> => {
    const { favoriteIds, isSaving, status } = get();

    if (status !== 'ready' || isSaving || !isKnownVideoId(videoId)) {
      return;
    }

    const nextIds = favoriteIds.includes(videoId)
      ? favoriteIds.filter((id) => id !== videoId)
      : [...favoriteIds, videoId];

    set({ error: null, favoriteIds: nextIds, isSaving: true });

    try {
      await saveFavoriteIds(nextIds);
      set({ isSaving: false });
    } catch (error: unknown) {
      console.warn('Не удалось сохранить избранное.', error);
      set({
        error: 'Не удалось сохранить изменение. Попробуйте ещё раз.',
        favoriteIds,
        isSaving: false,
      });
    }
  },
  clearFavorites: async (): Promise<void> => {
    const { favoriteIds, isSaving, status } = get();
    if (status !== 'ready' || isSaving) return;
    set({ favoriteIds: [], isSaving: true, error: null });
    try {
      await saveFavoriteIds([]);
      set({ isSaving: false });
    } catch (error: unknown) {
      console.warn('Не удалось очистить избранное.', error);
      set({ favoriteIds, isSaving: false, error: 'Не удалось очистить избранное.' });
    }
  },
}));
