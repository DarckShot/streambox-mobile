import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

import type { HistoryItem } from '../../types/history';
import { formatHistoryDate, historyProgressLabel, historyProgressRatio } from '../../utils/history';
import VideoCard from '../video/VideoCard';
import { historyScreenStyles as styles } from './historyStyles';

interface HistoryCardProps {
  item: HistoryItem;
  isDark: boolean;
  textColor: string;
  onOpenVideo: (videoId: string) => void;
}

export const HistoryCard = ({
  item,
  isDark,
  textColor,
  onOpenVideo,
}: HistoryCardProps): ReactElement => {
  const { video } = item;
  return (
    <View style={styles.item}>
      <VideoCard
        id={video.id}
        title={video.title}
        thumbnailUrl={video.thumbnailUrl}
        category={video.category}
        duration={video.duration}
        isDark={isDark}
        textColor={textColor}
        onPress={onOpenVideo}
        footer={
          <View style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}>
            <View style={styles.progressHeading}>
              <Text style={styles.progressLabel}>Прогресс просмотра</Text>
              <Text style={[styles.progressValue, { color: textColor }]}>
                {historyProgressLabel(item)}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${historyProgressRatio(item) * 100}%` }]}
              />
            </View>
            <Text style={[styles.dateText, isDark ? styles.textDark : styles.textLight]}>
              Последний просмотр: {formatHistoryDate(item.lastWatchedAt)}
            </Text>
          </View>
        }
      />
    </View>
  );
};
