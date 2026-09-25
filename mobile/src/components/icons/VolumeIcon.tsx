import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

interface VolumeIconProps {
  color: string;
  muted: boolean;
  size?: number;
}

export const VolumeIcon = ({ color, muted, size = 22 }: VolumeIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 9v6h4l5 4V5L9 9H5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {muted ? (
      <Path d="m18 9 4 4m0-4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <Path d="M17 8.5a5 5 0 0 1 0 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    )}
  </Svg>
);
