import { useTheme } from '@react-navigation/native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useCallback, type ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { videoQueries } from '../../api/videoQueries';
import { useOnline } from '../../services/networkState';
import { homeScreenStyles as styles } from '../../screens/HomeScreen.styles';
import type { Video } from '../../types/video';
import VideoCard from '../video/VideoCard';
import { HomeCatalogState } from './HomeCatalogState';
import { HomeHeader } from './HomeHeader';

interface HomeCatalogProps {
  onImport: () => void;
  onVideoPress: (videoId: string) => void;
}

const keyExtractor = (video: Video): string => video.id;
const ItemSeparator = (): ReactElement => <View style={styles.separator} />;

export const HomeCatalog = ({ onImport, onVideoPress }: HomeCatalogProps): ReactElement => {
  const { colors, dark } = useTheme();
  const online = useOnline();
  const {
    data: videos = [],
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery(videoQueries.list());
  const retry = useCallback((): void => {
    void refetch();
  }, [refetch]);
  const renderVideo = useCallback(
    ({ item }: ListRenderItemInfo<Video>): ReactElement => (
      <VideoCard
        id={item.id}
        title={item.title}
        thumbnailUrl={item.thumbnailUrl}
        category={item.category}
        duration={item.duration}
        isDark={dark}
        textColor={colors.text}
        onPress={onVideoPress}
      />
    ),
    [colors.text, dark, onVideoPress],
  );

  if (isPending || (isError && videos.length === 0) || videos.length === 0)
    return (
      <HomeCatalogState
        kind={isPending ? (online ? 'loading' : 'offline') : isError ? 'error' : 'empty'}
        error={error}
        isRefetching={isRefetching}
        onImport={onImport}
        onRetry={retry}
        textColor={colors.text}
      />
    );

  return (
    <FlashList
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      data={videos}
      onRefresh={retry}
      refreshing={isRefetching}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={keyExtractor}
      renderItem={renderVideo}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <HomeHeader onImportPress={onImport} />
          {isError ? (
            <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryText}>Показаны сохранённые данные · Повторить</Text>
            </Pressable>
          ) : null}
        </>
      }
    />
  );
};
