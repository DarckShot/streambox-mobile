import { memo, useCallback, type ReactElement } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { VideoPlaceholderIcon } from '../icons/VideoPlaceholderIcon';
import { videoCardStyles as styles } from './VideoCard.styles';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
  isDark: boolean;
  textColor: string;
  onPress?: (videoId: string) => void;
}

const VideoCard = ({
  id,
  title,
  thumbnailUrl,
  category,
  duration,
  isDark,
  textColor,
  onPress,
}: VideoCardProps): ReactElement => {
  const handlePress = useCallback((): void => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <Pressable
      accessibilityLabel={`${title}, ${category}, ${duration}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.thumbnail}>
        <View style={styles.fallback}>
          <VideoPlaceholderIcon color="#77738D" />
          <Text style={styles.fallbackText}>НЕТ ОБЛОЖКИ</Text>
        </View>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnailImage}
        />
        <Text style={styles.duration}>{duration}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryMark} />
          <Text style={styles.category}>{category}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(VideoCard);
