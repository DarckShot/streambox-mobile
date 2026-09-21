import type { ReactElement } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { NAVIGATION_ICON_SIZE, NAVIGATION_ICON_STROKE_WIDTH } from './navigationIcon.constants';
import type { NavigationIconProps } from './navigationIcon.types';

export const SearchIcon = ({
  color,
  focused,
  size = NAVIGATION_ICON_SIZE,
}: NavigationIconProps): ReactElement => {
  const strokeWidth = focused ? 2.3 : NAVIGATION_ICON_STROKE_WIDTH;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.75" cy="10.75" r="6.75" stroke={color} strokeWidth={strokeWidth} />
      <Path d="m16 16 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};
