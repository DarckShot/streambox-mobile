import { memo, type ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useRutubeVideoPlayback } from '../../hooks/useRutubeVideoPlayback';
import RutubePlayerPresentation from './RutubePlayerPresentation';

interface RutubeVideoPlayerProps {
  autoPlayOnOpen?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  posterUrl: string;
  videoId: string;
}

const RutubeVideoPlayer = ({
  autoPlayOnOpen = false,
  containerStyle,
  posterUrl,
  videoId,
}: RutubeVideoPlayerProps): ReactElement => {
  const playback = useRutubeVideoPlayback({ autoPlayOnOpen, videoId });

  return (
    <RutubePlayerPresentation
      containerStyle={containerStyle}
      playback={playback}
      posterUrl={posterUrl}
    />
  );
};

export default memo(RutubeVideoPlayer);
