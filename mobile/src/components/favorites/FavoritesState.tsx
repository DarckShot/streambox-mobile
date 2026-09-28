import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { favoritesScreenStyles as styles } from '../../screens/FavoritesScreen.styles';
import { HeartIcon } from '../icons/HeartIcon';

interface FavoritesStateProps {
  kind: 'offline' | 'loading' | 'error' | 'videos-loading' | 'videos-error' | 'empty';
  dark: boolean;
  error?: Error | null;
  onBrowse: () => void;
  onRetry: () => void;
  textColor: string;
}

const CONTENT = {
  offline: {
    title: 'Нет подключения',
    description: 'Избранное загрузится после восстановления сети.',
  },
  empty: {
    title: 'Здесь пока пусто',
    description: 'Откройте видео и нажмите «В избранное» — оно появится здесь.',
  },
  error: { title: 'Не удалось открыть избранное', description: 'Попробуйте ещё раз.' },
  'videos-error': { title: 'Не удалось загрузить избранное', description: 'Попробуйте ещё раз.' },
};

export const FavoritesState = ({
  kind,
  dark,
  error,
  onBrowse,
  onRetry,
  textColor,
}: FavoritesStateProps): ReactElement => {
  if (kind === 'loading' || kind === 'videos-loading')
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={STREAMBOX_COLORS.accent} size="large" />
        <Text style={[styles.stateDescription, { color: textColor }]}>
          {kind === 'loading' ? 'Загружаем избранное…' : 'Загружаем видео…'}
        </Text>
      </View>
    );

  const content = CONTENT[kind];
  const description = kind.includes('error')
    ? error?.message ?? content.description
    : content.description;

  return (
    <View style={styles.centerState}>
      {kind === 'empty' ? (
        <View style={styles.emptyIcon}>
          <HeartIcon color={STREAMBOX_COLORS.accent} size={42} />
        </View>
      ) : null}
      <Text
        accessibilityRole={kind.includes('error') ? 'alert' : undefined}
        style={[styles.stateTitle, { color: textColor }]}
      >
        {content.title}
      </Text>
      <Text style={[styles.stateDescription, dark ? styles.subtitleDark : styles.subtitleLight]}>
        {description}
      </Text>
      {kind === 'empty' && error ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.errorBanner,
            { color: dark ? STREAMBOX_COLORS.errorDark : STREAMBOX_COLORS.errorLight },
          ]}
        >
          {error.message}
        </Text>
      ) : null}
      {kind !== 'offline' ? (
        <Pressable
          accessibilityRole="button"
          onPress={kind === 'empty' ? onBrowse : onRetry}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>
            {kind === 'empty' ? 'Смотреть каталог' : 'Повторить'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
