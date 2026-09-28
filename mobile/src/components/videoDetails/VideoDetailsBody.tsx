import type { ReactElement } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Video } from '../../types/video';
import { useSyncVideo } from '../../hooks/useVideoMutations';
import { videoDetailsScreenStyles as styles } from '../../screens/VideoDetailsScreen.styles';
import { FavoriteToggleButton } from '../favorites/FavoriteToggleButton';
import { ScrollEdgeBlur } from '../scroll/ScrollEdgeBlur';
import { VideoDetailsTitle } from './VideoDetailsTitle';

interface VideoDetailsBodyProps {
  dark: boolean;
  isCompact: boolean;
  isLandscape: boolean;
  textColor: string;
  video: Video;
}

export const VideoDetailsBody = ({
  dark,
  isCompact,
  isLandscape,
  textColor,
  video,
}: VideoDetailsBodyProps): ReactElement => {
  const sync = useSyncVideo();
  const secondaryTextStyle = dark ? styles.textDark : styles.textLight;

  return (
    <ScrollEdgeBlur>
      <ScrollView
        style={styles.detailsScroll}
        contentContainerStyle={[styles.details, isCompact ? styles.detailsCompact : null]}
      >
        <View style={styles.categoryRow}>
          <View style={styles.categoryMark} />
          <Text style={styles.category}>{video.category}</Text>
        </View>

        <VideoDetailsTitle title={video.title} isCompact={isCompact} textColor={textColor} />

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, secondaryTextStyle]}>Длительность</Text>
          <Text style={[styles.metaValue, { color: textColor }]}>{video.duration}</Text>
        </View>
        {video.author ? (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, secondaryTextStyle]}>Автор</Text>
            <Text style={[styles.metaValue, { color: textColor }]}>{video.author}</Text>
          </View>
        ) : null}

        <View style={[styles.divider, dark ? styles.dividerDark : styles.dividerLight]} />

        <View style={[styles.descriptionBlock, isCompact ? styles.descriptionBlockCompact : null]}>
          <Text
            style={[
              styles.sectionTitle,
              isCompact ? styles.sectionTitleCompact : null,
              { color: textColor },
            ]}
          >
            О видео
          </Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={isLandscape ? 3 : isCompact ? 2 : 4}
            style={[
              styles.description,
              isCompact ? styles.descriptionCompact : null,
              secondaryTextStyle,
            ]}
          >
            {video.description || 'Описание не указано.'}
          </Text>
        </View>

        <View style={styles.actions}>
          <FavoriteToggleButton
            compact={isCompact}
            isDark={dark}
            textColor={textColor}
            videoId={video.id}
          />
          <Pressable
            accessibilityRole="button"
            disabled={sync.isPending}
            onPress={() => sync.mutate(video.id)}
            style={styles.syncButton}
          >
            <Text style={styles.syncButtonText}>
              {sync.isPending ? 'Обновляем…' : 'Обновить данные RUTUBE'}
            </Text>
          </Pressable>
          {sync.error ? (
            <Text accessibilityRole="alert" style={styles.syncError}>
              {sync.error.message}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </ScrollEdgeBlur>
  );
};
