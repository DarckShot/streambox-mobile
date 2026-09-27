import { useFavoritesStore } from '../store/useFavoritesStore';
import { useSavedProgressStore } from '../store/useSavedProgressStore';
import { useWatchHistoryStore } from '../store/useWatchHistoryStore';

export interface ProfileSummary {
  favorites: number | null;
  watched: number | null;
  inProgress: number | null;
  isEmpty: boolean;
}

export const useProfileSummary = (): ProfileSummary => {
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);
  const favoritesLoaded = useFavoritesStore((state) => state.status === 'ready');
  const watchedCount = useWatchHistoryStore((state) => state.entries.length);
  const historyLoaded = useWatchHistoryStore((state) => state.loaded);
  const progressCount = useSavedProgressStore((state) => Object.keys(state.positions).length);
  const progressLoaded = useSavedProgressStore((state) => state.loaded);

  const favorites = favoritesLoaded ? favoriteCount : null;
  const watched = historyLoaded ? watchedCount : null;
  const inProgress = progressLoaded ? progressCount : null;

  return {
    favorites,
    watched,
    inProgress,
    isEmpty: [favorites, watched, inProgress].every((count) => count === 0),
  };
};
