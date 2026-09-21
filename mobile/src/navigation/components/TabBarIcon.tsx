import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import type { NavigationIconComponent } from '../../components/icons/navigationIcon.types';
import { STREAMBOX_COLORS } from '../../constants/theme';

type TabBarIconRenderer = NonNullable<BottomTabNavigationOptions['tabBarIcon']>;

export function createTabBarIcon(Icon: NavigationIconComponent): TabBarIconRenderer {
  return ({ color, focused, size }): ReactElement => (
    <View style={[styles.container, focused && styles.focused]}>
      <Icon color={color} focused={focused} size={size - 1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 44,
  },
  focused: {
    backgroundColor: STREAMBOX_COLORS.tabIconActive,
  },
});
