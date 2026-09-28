import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { videoDetailsScreenStyles as styles } from '../screens/VideoDetailsScreen.styles';

export const useVideoDetailsLayout = () => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isCompact = height < 760 || isLandscape;
  const playerHeight = Math.min(width * (9 / 16), height * 0.29);
  const portraitPlayerStyle = useMemo(
    () => [styles.playerPortrait, { height: playerHeight }],
    [playerHeight],
  );

  return { isLandscape, isCompact, portraitPlayerStyle };
};
