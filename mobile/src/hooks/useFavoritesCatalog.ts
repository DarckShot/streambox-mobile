import { useUserCollections } from './useUserData';
import { useVideosByIds } from './useVideosByIds';
import { useOnline } from '../services/networkState';

export const useFavoritesCatalog = () => {
  const online = useOnline();
  const { favorites } = useUserCollections();
  const favoriteIds = favorites.data?.map((item) => item.videoId) ?? [];
  const videos = useVideosByIds(favoriteIds);
  const favoriteVideos = favoriteIds.flatMap((id) => {
    const video = videos.byId.get(id);
    return video ? [video] : [];
  });
  const status = favorites.data
    ? 'ready'
    : favorites.isPending
    ? 'loading'
    : favorites.isError
    ? 'error'
    : 'ready';

  return {
    status,
    online,
    favoriteCount: favoriteIds.length,
    favoriteVideos,
    favoritesError: favorites.error,
    videosError: videos.error,
    videosLoading: videos.isLoading,
    retryFavorites: favorites.refetch,
    retryVideos: videos.refetch,
  };
};
