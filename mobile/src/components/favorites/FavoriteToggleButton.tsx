import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { useFavoriteMutation, useUserCollections } from '../../hooks/useUserData';
import { HeartIcon } from '../icons/HeartIcon';
import { favoriteToggleButtonStyles as styles } from './FavoriteToggleButton.styles';

interface FavoriteToggleButtonProps {
  compact: boolean;
  isDark: boolean;
  textColor: string;
  videoId: string;
}

const getButtonLabel = (
  status: 'loading' | 'ready' | 'error',
  isSaving: boolean,
  isFavorite: boolean,
): string => {
  if (status === 'loading') {
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
  const { userId, favorites } = useUserCollections();
  const mutation = useFavoriteMutation(userId);
  const isFavorite = favorites.data?.some((item) => item.videoId === videoId) ?? false;
  const status = favorites.isPending ? 'loading' : favorites.isError ? 'error' : 'ready';
  const isSaving = mutation.isPending;
  const error = mutation.error?.message ?? favorites.error?.message;
  const disabled = status !== 'ready' || isSaving;
  const label = getButtonLabel(status, isSaving, isFavorite);

  const handlePress = (): void => {
    mutation.mutate({ videoId, remove: isFavorite });
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
        <Pressable
          accessibilityRole="button"
          onPress={() => favorites.refetch()}
          style={styles.retry}
        >
          <Text style={styles.retryText}>Повторить загрузку</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
