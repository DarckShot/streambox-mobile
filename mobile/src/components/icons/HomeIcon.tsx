import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

import { NAVIGATION_ICON_SIZE, NAVIGATION_ICON_STROKE_WIDTH } from './navigationIcon.constants';
import type { NavigationIconProps } from './navigationIcon.types';

export const HomeIcon = ({
  color,
  focused,
  size = NAVIGATION_ICON_SIZE,
}: NavigationIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 10.6 12 3.5l8.5 7.1v8.15a1.75 1.75 0 0 1-1.75 1.75h-4.5v-5.25h-4.5v5.25h-4.5a1.75 1.75 0 0 1-1.75-1.75V10.6Z"
      stroke={color}
      strokeWidth={focused ? 2.3 : NAVIGATION_ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.14 : 0}
    />
  </Svg>
);
