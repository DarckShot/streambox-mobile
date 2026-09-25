import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

type PlayIconProps = {
  color: string;
  size?: number;
};

export const PlayIcon = ({ color, size = 20 }: PlayIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.75 4.28c0-1.1 1.2-1.77 2.13-1.18l7.02 4.47a2.88 2.88 0 0 1 0 4.86L8.88 16.9a1.39 1.39 0 0 1-2.13-1.18V4.28Z"
      fill={color}
    />
  </Svg>
);
