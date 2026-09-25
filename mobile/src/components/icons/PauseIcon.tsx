import type { ReactElement } from 'react';
import Svg, { Rect } from 'react-native-svg';

interface PauseIconProps {
  color: string;
  size?: number;
}

export const PauseIcon = ({ color, size = 20 }: PauseIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x="4.5" y="3" width="4" height="14" rx="1.5" fill={color} />
    <Rect x="11.5" y="3" width="4" height="14" rx="1.5" fill={color} />
  </Svg>
);
