import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

type HeartIconProps = {
  color: string;
  size?: number;
};

export const HeartIcon = ({ color, size = 22 }: HeartIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
