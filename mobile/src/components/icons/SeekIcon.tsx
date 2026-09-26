import type { ReactElement } from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface SeekIconProps {
  color: string;
  direction: 'backward' | 'forward';
  size?: number;
}

export const SeekIcon = ({ color, direction, size = 24 }: SeekIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d={
        direction === 'backward'
          ? 'M7.5 6.5H3.8V2.8M4.2 6.1A8.7 8.7 0 1 1 3.7 17'
          : 'M16.5 6.5h3.7V2.8m-.4 3.3A8.7 8.7 0 1 0 20.3 17'
      }
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <SvgText fill={color} fontSize="8" fontWeight="800" textAnchor="middle" x="12" y="14.8">
      10
    </SvgText>
  </Svg>
);
