import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { homeScreenStyles as styles } from '../../screens/HomeScreen.styles';

interface HomeCatalogStateProps {
  kind: 'offline' | 'loading' | 'error' | 'empty';
  error?: Error | null;
  isRefetching: boolean;
  onImport: () => void;
  onRetry: () => void;
  textColor: string;
}

const CONTENT = {
  offline: { title: 'Нет подключения', description: 'Каталог появится после восстановления сети.' },
  error: {
    title: 'Не удалось загрузить каталог',
    description: 'Попробуйте загрузить каталог ещё раз.',
  },
  empty: { title: 'Каталог пока пуст', description: 'Добавьте первое видео RUTUBE.' },
};

export const HomeCatalogState = ({
  kind,
  error,
  isRefetching,
  onImport,
  onRetry,
  textColor,
}: HomeCatalogStateProps): ReactElement => {
  if (kind === 'loading')
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={STREAMBOX_COLORS.accent} size="large" />
        <Text style={{ color: textColor }}>Загружаем каталог…</Text>
      </View>
    );

  const content = CONTENT[kind];
  const description =
    kind === 'error' ? error?.message ?? content.description : content.description;
  const retryLabel = kind === 'empty' ? (isRefetching ? 'Обновляем…' : 'Обновить') : 'Повторить';

  return (
    <View style={styles.centerState}>
      <Text
        accessibilityRole={kind === 'error' ? 'alert' : undefined}
        style={[styles.stateTitle, { color: textColor }]}
      >
        {content.title}
      </Text>
      <Text style={{ color: textColor }}>{description}</Text>
      {kind === 'empty' ? (
        <Pressable accessibilityRole="button" onPress={onImport} style={styles.retryButton}>
          <Text style={styles.retryText}>Добавить видео</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
};
