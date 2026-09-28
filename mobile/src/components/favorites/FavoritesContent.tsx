import type { ReactElement } from 'react';

import { STREAMBOX_COLORS } from '../../constants/theme';
import type { useFavoritesCatalog } from '../../hooks/useFavoritesCatalog';
import { FavoritesList } from './FavoritesList';
import { FavoritesState } from './FavoritesState';

interface FavoritesContentProps {
  catalog: ReturnType<typeof useFavoritesCatalog>;
  dark: boolean;
  onBrowse: () => void;
  onVideoPress: (videoId: string) => void;
  textColor: string;
}

export const FavoritesContent = ({
  catalog,
  dark,
  onBrowse,
  onVideoPress,
  textColor,
}: FavoritesContentProps): ReactElement => {
  const retryFavorites = (): void => {
    void catalog.retryFavorites();
  };

  if (catalog.status === 'loading' || catalog.status === 'error')
    return (
      <FavoritesState
        kind={catalog.status === 'loading' ? (catalog.online ? 'loading' : 'offline') : 'error'}
        dark={dark}
        error={catalog.favoritesError}
        onBrowse={onBrowse}
        onRetry={retryFavorites}
        textColor={textColor}
      />
    );

  if (catalog.favoriteCount > 0 && catalog.videosLoading)
    return (
      <FavoritesState
        kind="videos-loading"
        dark={dark}
        onBrowse={onBrowse}
        onRetry={catalog.retryVideos}
        textColor={textColor}
      />
    );

  if (catalog.videosError && catalog.favoriteVideos.length === 0)
    return (
      <FavoritesState
        kind="videos-error"
        dark={dark}
        error={catalog.videosError}
        onBrowse={onBrowse}
        onRetry={catalog.retryVideos}
        textColor={textColor}
      />
    );

  if (catalog.favoriteCount === 0)
    return (
      <FavoritesState
        kind="empty"
        dark={dark}
        error={catalog.favoritesError}
        onBrowse={onBrowse}
        onRetry={retryFavorites}
        textColor={textColor}
      />
    );

  return (
    <FavoritesList
      dark={dark}
      error={catalog.favoritesError}
      errorColor={dark ? STREAMBOX_COLORS.errorDark : STREAMBOX_COLORS.errorLight}
      onVideoPress={onVideoPress}
      textColor={textColor}
      videos={catalog.favoriteVideos}
    />
  );
};
