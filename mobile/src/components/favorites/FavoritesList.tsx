import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { Text, View } from 'react-native';

import type { Video } from '../../types/video';
import { favoritesScreenStyles as styles } from '../../screens/FavoritesScreen.styles';
import { ScrollEdgeBlur } from '../scroll/ScrollEdgeBlur';
import VideoCard from '../video/VideoCard';

interface FavoritesListProps {
  dark: boolean;
  error: Error | null;
  errorColor: string;
  onVideoPress: (videoId: string) => void;
  textColor: string;
  videos: Video[];
}

const keyExtractor = (video: Video): string => video.id;
const ItemSeparator = (): ReactElement => <View style={styles.separator} />;

export const FavoritesList = ({
  dark,
  error,
  errorColor,
  onVideoPress,
  textColor,
  videos,
}: FavoritesListProps): ReactElement => {
  const renderVideo = useCallback(
    ({ item }: ListRenderItemInfo<Video>): ReactElement => (
      <VideoCard
        id={item.id}
        title={item.title}
        thumbnailUrl={item.thumbnailUrl}
        category={item.category}
        duration={item.duration}
        isDark={dark}
        textColor={textColor}
        onPress={onVideoPress}
      />
    ),
    [dark, onVideoPress, textColor],
  );

  return (
    <>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.errorBanner, { color: errorColor }]}>
          {error.message}
        </Text>
      ) : null}
      <ScrollEdgeBlur>
        <FlashList
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="never"
          data={videos}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={keyExtractor}
          renderItem={renderVideo}
          showsVerticalScrollIndicator={false}
        />
      </ScrollEdgeBlur>
    </>
  );
};
