import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { useFavoritesStore, type FavoritesStatus } from '../../store/useFavoritesStore';
import { HeartIcon } from '../icons/HeartIcon';
import { favoriteToggleButtonStyles as styles } from './FavoriteToggleButton.styles';

interface FavoriteToggleButtonProps {
  compact: boolean;
  isDark: boolean;
  textColor: string;
  videoId: string;
}

const getButtonLabel = (
  status: FavoritesStatus,
  isSaving: boolean,
  isFavorite: boolean,
): string => {
  if (status === 'idle' || status === 'loading') {
    return 'Загрузка избранного…';
  }
  if (status === 'error') {
    return 'Избранное недоступно';
  }
  if (isSaving) {
    return 'Сохранение…';
  }
  return isFavorite ? 'Убрать из избранного' : 'В избранное';
};

export const FavoriteToggleButton = ({
  compact,
  isDark,
  textColor,
  videoId,
}: FavoriteToggleButtonProps): ReactElement => {
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.includes(videoId));
  const status = useFavoritesStore((state) => state.status);
  const isSaving = useFavoritesStore((state) => state.isSaving);
  const error = useFavoritesStore((state) => state.error);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const disabled = status !== 'ready' || isSaving;
  const label = getButtonLabel(status, isSaving, isFavorite);

  const handlePress = (): void => {
    toggleFavorite(videoId);
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: isFavorite }}
        disabled={disabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          compact ? styles.buttonCompact : null,
          isDark ? styles.buttonDark : styles.buttonLight,
          disabled ? styles.buttonDisabled : null,
          pressed ? styles.buttonPressed : null,
        ]}
      >
        <HeartIcon color={STREAMBOX_COLORS.accent} filled={isFavorite} />
        <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
      </Pressable>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.error,
            { color: isDark ? STREAMBOX_COLORS.errorDark : STREAMBOX_COLORS.errorLight },
          ]}
        >
          {error}
        </Text>
      ) : null}
      {status === 'error' ? (
        <Pressable accessibilityRole="button" onPress={() => loadFavorites()} style={styles.retry}>
          <Text style={styles.retryText}>Повторить загрузку</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
