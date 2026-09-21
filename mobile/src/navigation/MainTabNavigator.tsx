import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useMemo, type ReactElement } from 'react';

import { FavoritesIcon } from '../components/icons/FavoritesIcon';
import { HomeIcon } from '../components/icons/HomeIcon';
import { ProfileIcon } from '../components/icons/ProfileIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { STREAMBOX_COLORS } from '../constants/theme';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { createTabBarIcon } from './components/TabBarIcon';
import { mainTabNavigatorStyles as styles } from './MainTabNavigator.styles';
import { TabRoute } from './routes';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderHomeIcon = createTabBarIcon(HomeIcon);
const renderSearchIcon = createTabBarIcon(SearchIcon);
const renderFavoritesIcon = createTabBarIcon(FavoritesIcon);
const renderProfileIcon = createTabBarIcon(ProfileIcon);

const HOME_OPTIONS: BottomTabNavigationOptions = {
  tabBarLabel: 'Главная',
  tabBarIcon: renderHomeIcon,
};

const SEARCH_OPTIONS: BottomTabNavigationOptions = {
  tabBarLabel: 'Поиск',
  tabBarIcon: renderSearchIcon,
};

const FAVORITES_OPTIONS: BottomTabNavigationOptions = {
  tabBarLabel: 'Избранное',
  tabBarIcon: renderFavoritesIcon,
};

const PROFILE_OPTIONS: BottomTabNavigationOptions = {
  tabBarLabel: 'Профиль',
  tabBarIcon: renderProfileIcon,
};

export const MainTabNavigator = (): ReactElement => {
  const { dark } = useTheme();
  const screenOptions = useMemo<BottomTabNavigationOptions>(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: STREAMBOX_COLORS.accent,
      tabBarInactiveTintColor: dark
        ? STREAMBOX_COLORS.tabBarInactiveDark
        : STREAMBOX_COLORS.tabBarInactiveLight,
      tabBarHideOnKeyboard: true,
      tabBarLabelStyle: styles.label,
      tabBarStyle: [styles.tabBar, dark ? styles.tabBarDark : styles.tabBarLight],
    }),
    [dark],
  );

  return (
    <Tab.Navigator initialRouteName={TabRoute.Home} screenOptions={screenOptions}>
      <Tab.Screen name={TabRoute.Home} component={HomeScreen} options={HOME_OPTIONS} />
      <Tab.Screen name={TabRoute.Search} component={SearchScreen} options={SEARCH_OPTIONS} />
      <Tab.Screen
        name={TabRoute.Favorites}
        component={FavoritesScreen}
        options={FAVORITES_OPTIONS}
      />
      <Tab.Screen name={TabRoute.Profile} component={ProfileScreen} options={PROFILE_OPTIONS} />
    </Tab.Navigator>
  );
};
