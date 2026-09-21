import type { ReactElement } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { NAVIGATION_ICON_SIZE, NAVIGATION_ICON_STROKE_WIDTH } from './navigationIcon.constants';
import type { NavigationIconProps } from './navigationIcon.types';

export const ProfileIcon = ({
  color,
  focused,
  size = NAVIGATION_ICON_SIZE,
}: NavigationIconProps): ReactElement => {
  const strokeWidth = focused ? 2.3 : NAVIGATION_ICON_STROKE_WIDTH;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.14 : 0}
      />
      <Path
        d="M5.25 20c.5-3.35 3.05-5.5 6.75-5.5s6.25 2.15 6.75 5.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};
