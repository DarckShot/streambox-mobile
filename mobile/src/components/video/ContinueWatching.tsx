import { useQuery } from '@tanstack/react-query';
import { useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { userQueries } from '../../api/userQueries';
import { useCurrentUser } from '../../hooks/useUserData';
import { useVideosByIds } from '../../hooks/useVideosByIds';
import { RootRoute } from '../../navigation/routes';
import type { RootStackParamList } from '../../navigation/types';
import VideoCard from './VideoCard';

const styles = StyleSheet.create({
  section: { gap: 14, marginBottom: 22 },
  title: { fontSize: 22, fontWeight: '800' },
  list: { gap: 14 },
  card: { width: 260 },
  progressTrack: { height: 6, backgroundColor: '#DDD8F0' },
  progressFill: { height: 6, backgroundColor: '#7C5CFC' },
});

export const ContinueWatching = (): ReactElement | null => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();
  const user = useCurrentUser();
  const progress = useQuery({
    ...userQueries.progress(user.data?.id ?? ''),
    enabled: Boolean(user.data?.id),
  });
  const active = (progress.data ?? []).filter(
    (item) =>
      item.positionSeconds > 0 &&
      (item.durationSeconds <= 0 || item.positionSeconds < item.durationSeconds - 1),
  );
  const { byId } = useVideosByIds(active.map((item) => item.videoId));
  if (active.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Продолжить просмотр</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {active.map((item) => {
          const video = byId.get(item.videoId);
          if (!video) return null;
          const percent =
            item.durationSeconds > 0 ? Math.min(item.positionSeconds / item.durationSeconds, 1) : 0;
          return (
            <View key={video.id} style={styles.card}>
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                category={video.category}
                duration={video.duration}
                isDark={dark}
                textColor={colors.text}
                onPress={() => navigation.navigate(RootRoute.Player, { videoId: video.id })}
                footer={
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${percent * 100}%` }]} />
                  </View>
                }
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
