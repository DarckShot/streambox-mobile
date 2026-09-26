import { memo, type ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useRutubeVideoPlayback } from '../../hooks/useRutubeVideoPlayback';
import RutubePlayerPresentation from './RutubePlayerPresentation';

interface RutubeVideoPlayerProps {
  containerStyle?: StyleProp<ViewStyle>;
  externalId: string;
  posterUrl: string;
  videoId: string;
}

const RutubeVideoPlayer = ({
  containerStyle,
  externalId,
  posterUrl,
  videoId,
}: RutubeVideoPlayerProps): ReactElement => {
  const playback = useRutubeVideoPlayback({ externalId, videoId });

  return (
    <RutubePlayerPresentation
      containerStyle={containerStyle}
      playback={playback}
      posterUrl={posterUrl}
    />
  );
};

export default memo(RutubeVideoPlayer);
