import { useTheme } from '@react-navigation/native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { HistoryItem } from '../../types/history';
import { ScrollEdgeBlur } from '../scroll/ScrollEdgeBlur';
import { HistoryCard } from './HistoryCard';
import { historyScreenStyles as styles } from './historyStyles';

interface HistoryContentProps {
  items: HistoryItem[];
  recordCount: number;
  loading: boolean;
  videosLoading: boolean;
  error: string | null;
  videosError: Error | null;
  onOpenVideo: (videoId: string) => void;
  onRetry: () => void;
}

const keyExtractor = (item: HistoryItem): string => item.video.id;

export const HistoryContent = ({
  items,
  recordCount,
  loading,
  videosLoading,
  error,
  videosError,
  onOpenVideo,
  onRetry,
}: HistoryContentProps): ReactElement => {
  const { colors, dark } = useTheme();
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HistoryItem>): ReactElement => (
      <HistoryCard item={item} isDark={dark} textColor={colors.text} onOpenVideo={onOpenVideo} />
    ),
    [colors.text, dark, onOpenVideo],
  );

  if (loading) {
    return (
      <View style={styles.centerState}>
        <Text style={[styles.stateText, { color: colors.text }]}>Загружаем историю…</Text>
      </View>
    );
  }
  if (error && recordCount === 0) {
    return (
      <View style={styles.centerState}>
        <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
          Не удалось загрузить историю
        </Text>
        <Text style={[styles.stateText, { color: colors.text }]}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.clearButton}>
          <Text style={styles.clearText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }
  if (recordCount > 0 && videosLoading && items.length === 0) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
        <Text style={{ color: colors.text }}>Загружаем видео…</Text>
      </View>
    );
  }
  if (recordCount > 0 && videosError && items.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
          Не удалось загрузить видео
        </Text>
        <Text style={{ color: colors.text }}>{videosError.message}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.clearButton}>
          <Text style={styles.clearText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }
  if (recordCount === 0 || items.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={[styles.stateTitle, { color: colors.text }]}>
          {recordCount === 0 ? 'История пока пуста' : 'Видео из истории недоступны'}
        </Text>
        <Text style={[styles.stateText, dark ? styles.textDark : styles.textLight]}>
          {recordCount === 0
            ? 'Начните смотреть видео — оно появится здесь.'
            : 'Попробуйте открыть историю позже.'}
        </Text>
      </View>
    );
  }
  return (
    <ScrollEdgeBlur>
      <FlashList
        data={items}
        contentContainerStyle={styles.listContent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </ScrollEdgeBlur>
  );
};
