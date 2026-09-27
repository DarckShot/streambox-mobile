import { useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import VideoCard from '../components/video/VideoCard';
import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';
import { useVideosByIds } from '../hooks/useVideosByIds';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import type { WatchHistoryEntry } from '../storage/watchHistory';
import { useWatchHistoryStore } from '../store/useWatchHistoryStore';
import type { Video } from '../types/video';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';
import { historyScreenStyles as styles } from './HistoryScreen.styles';

type HistoryItem = { entry: WatchHistoryEntry; video: Video };
const keyExtractor = (item: HistoryItem): string => item.video.id;
const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

export const HistoryScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();
  const entries = useWatchHistoryStore((state) => state.entries);
  const loaded = useWatchHistoryStore((state) => state.loaded);
  const error = useWatchHistoryStore((state) => state.error);
  const clearHistory = useWatchHistoryStore((state) => state.clearHistory);
  const {
    byId,
    isLoading: videosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useVideosByIds(entries.map((entry) => entry.videoId));
  const items = entries.flatMap((entry) => {
    const video = byId.get(entry.videoId);
    return video ? [{ entry, video }] : [];
  });

  const handleVideoPress = useCallback(
    (videoId: string): void => navigation.navigate(RootRoute.VideoDetails, { videoId }),
    [navigation],
  );
  const handleClearPress = useCallback((): void => {
    Alert.alert('Очистить историю?', 'Все записи о просмотренных видео будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: clearHistory },
    ]);
  }, [clearHistory]);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HistoryItem>): ReactElement => {
      const { entry, video } = item;
      const progress =
        entry.position === 0
          ? 1
          : entry.duration > 0
          ? Math.min(entry.position / entry.duration, 1)
          : 0;
      return (
        <View style={styles.item}>
          <VideoCard
            id={video.id}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
            category={video.category}
            duration={video.duration}
            isDark={dark}
            textColor={colors.text}
            onPress={handleVideoPress}
            footer={
              <View style={[styles.footer, dark ? styles.footerDark : styles.footerLight]}>
                <View style={styles.progressHeading}>
                  <Text style={styles.progressLabel}>Прогресс просмотра</Text>
                  <Text style={[styles.progressValue, { color: colors.text }]}>
                    {entry.position > 0
                      ? `${formatPlaybackTime(entry.position)} / ${formatPlaybackTime(
                          entry.duration,
                        )}`
                      : 'Просмотрено до конца'}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={[styles.dateText, dark ? styles.textDark : styles.textLight]}>
                  Последний просмотр: {formatDate(entry.lastWatchedAt)}
                </Text>
              </View>
            }
          />
        </View>
      );
    },
    [colors.text, dark, handleVideoPress],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Продолжите просмотр</Text>
        <Text style={[styles.title, { color: colors.text }]}>История</Text>
        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleClearPress}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Очистить историю</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {!loaded ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateText, { color: colors.text }]}>Загружаем историю…</Text>
        </View>
      ) : entries.length > 0 && videosLoading && items.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator />
          <Text style={{ color: colors.text }}>Загружаем видео…</Text>
        </View>
      ) : entries.length > 0 && videosError && items.length === 0 ? (
        <View style={styles.centerState}>
          <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
            Не удалось загрузить видео
          </Text>
          <Text style={{ color: colors.text }}>{videosError.message}</Text>
          <Pressable accessibilityRole="button" onPress={refetchVideos} style={styles.clearButton}>
            <Text style={styles.clearText}>Повторить</Text>
          </Pressable>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>История пока пуста</Text>
          <Text style={[styles.stateText, dark ? styles.textDark : styles.textLight]}>
            Начните смотреть видео — оно появится здесь.
          </Text>
        </View>
      ) : (
        <ScrollEdgeBlur>
          <FlashList
            data={items}
            contentContainerStyle={styles.listContent}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </ScrollEdgeBlur>
      )}
    </View>
  );
};
