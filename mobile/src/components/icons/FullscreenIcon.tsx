import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

interface FullscreenIconProps {
  color: string;
  fullscreen?: boolean;
  size?: number;
}

export const FullscreenIcon = ({
  color,
  fullscreen = false,
  size = 22,
}: FullscreenIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d={
        fullscreen
          ? 'M9 4v5H4m11-5v5h5M9 20v-5H4m11 5v-5h5'
          : 'M8 4H4v4m12-4h4v4M8 20H4v-4m12 4h4v-4'
      }
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
