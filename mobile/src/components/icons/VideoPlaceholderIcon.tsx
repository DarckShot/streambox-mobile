import type { ReactElement } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type VideoPlaceholderIconProps = {
  color: string;
  size?: number;
};

export const VideoPlaceholderIcon = ({
  color,
  size = 42,
}: VideoPlaceholderIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
    <Rect x="3.5" y="7.5" width="35" height="27" rx="8" stroke={color} strokeWidth="2" />
    <Path d="m18 15.5 10 5.5-10 5.5v-11Z" fill={color} stroke={color} strokeLinejoin="round" />
  </Svg>
);
