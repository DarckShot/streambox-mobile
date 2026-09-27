import { useUserCollections } from './useUserData';

export interface ProfileSummary {
  favorites: number | null;
  watched: number | null;
  inProgress: number | null;
  isEmpty: boolean;
}

export const useProfileSummary = (): ProfileSummary => {
  const collections = useUserCollections();
  const favorites = collections.favorites.data?.length ?? null;
  const watched = collections.history.data?.length ?? null;
  const inProgress = collections.progress.data?.length ?? null;

  return {
    favorites,
    watched,
    inProgress,
    isEmpty: [favorites, watched, inProgress].every((count) => count === 0),
  };
};
