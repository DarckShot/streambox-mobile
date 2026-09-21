import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const mainTabNavigatorStyles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 7,
  },
  tabBarDark: {
    backgroundColor: STREAMBOX_COLORS.tabBarDark,
    borderTopColor: STREAMBOX_COLORS.tabBarBorderDark,
  },
  tabBarLight: {
    backgroundColor: STREAMBOX_COLORS.tabBarLight,
    borderTopColor: STREAMBOX_COLORS.tabBarBorderLight,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
});
