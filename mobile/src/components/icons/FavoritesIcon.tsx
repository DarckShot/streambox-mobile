import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

import { NAVIGATION_ICON_SIZE, NAVIGATION_ICON_STROKE_WIDTH } from './navigationIcon.constants';
import type { NavigationIconProps } from './navigationIcon.types';

export const FavoritesIcon = ({
  color,
  focused,
  size = NAVIGATION_ICON_SIZE,
}: NavigationIconProps): ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m12 20.25-1.23-1.1C6.4 15.25 3.5 12.66 3.5 9.48A4.62 4.62 0 0 1 8.17 4.8c1.47 0 2.88.69 3.83 1.77a5.13 5.13 0 0 1 3.83-1.77 4.62 4.62 0 0 1 4.67 4.68c0 3.18-2.9 5.77-7.27 9.68L12 20.25Z"
      stroke={color}
      strokeWidth={focused ? 2.3 : NAVIGATION_ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.16 : 0}
    />
  </Svg>
);
