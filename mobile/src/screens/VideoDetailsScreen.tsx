import { useTheme } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Pressable, Text } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { videoQueries } from '../api/videoQueries';
import RutubeVideoPlayer from '../components/player/RutubeVideoPlayer';
import { VideoDetailsBody } from '../components/videoDetails/VideoDetailsBody';
import { VideoDetailsState } from '../components/videoDetails/VideoDetailsState';
import { useVideoDetailsLayout } from '../hooks/useVideoDetailsLayout';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useOnline } from '../services/networkState';
import { videoDetailsScreenStyles as styles } from './VideoDetailsScreen.styles';

type VideoDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  RootRoute.VideoDetails | RootRoute.Player
>;

const SAFE_AREA_EDGES: Edge[] = ['left', 'right', 'bottom'];

export const VideoDetailsScreen = ({
  navigation,
  route,
}: VideoDetailsScreenProps): ReactElement => {
  const { colors, dark } = useTheme();
  const online = useOnline();
  const layout = useVideoDetailsLayout();
  const {
    data: video,
    isPending,
    error,
    refetch,
  } = useQuery(videoQueries.detail(route.params.videoId));

  if (isPending || !video)
    return (
      <VideoDetailsState
        backgroundColor={colors.background}
        dark={dark}
        error={error}
        loading={isPending}
        online={online}
        onBack={navigation.goBack}
        onRetry={() => void refetch()}
        textColor={colors.text}
      />
    );

  return (
    <SafeAreaView
      edges={SAFE_AREA_EDGES}
      style={[
        styles.screen,
        layout.isLandscape ? styles.screenLandscape : null,
        { backgroundColor: colors.background },
      ]}
    >
      <RutubeVideoPlayer
        autoPlayOnOpen={route.name === RootRoute.Player}
        containerStyle={layout.isLandscape ? styles.playerLandscape : layout.portraitPlayerStyle}
        key={video.id}
        posterUrl={video.thumbnailUrl}
        videoId={video.id}
      />
      {error ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void refetch()}
          style={styles.syncButton}
        >
          <Text style={styles.syncButtonText}>Показаны сохранённые данные · Повторить</Text>
        </Pressable>
      ) : null}
      <VideoDetailsBody
        dark={dark}
        isCompact={layout.isCompact}
        isLandscape={layout.isLandscape}
        key={`details-${video.id}`}
        textColor={colors.text}
        video={video}
      />
    </SafeAreaView>
  );
};
