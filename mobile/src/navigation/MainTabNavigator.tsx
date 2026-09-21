import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';

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

export function MainTabNavigator(): ReactElement {
  const { dark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={TabRoute.Home}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: STREAMBOX_COLORS.accent,
        tabBarInactiveTintColor: dark
          ? STREAMBOX_COLORS.tabBarInactiveDark
          : STREAMBOX_COLORS.tabBarInactiveLight,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [styles.tabBar, dark ? styles.tabBarDark : styles.tabBarLight],
      }}
    >
      <Tab.Screen
        name={TabRoute.Home}
        component={HomeScreen}
        options={{ tabBarLabel: 'Главная', tabBarIcon: renderHomeIcon }}
      />
      <Tab.Screen
        name={TabRoute.Search}
        component={SearchScreen}
        options={{ tabBarLabel: 'Поиск', tabBarIcon: renderSearchIcon }}
      />
      <Tab.Screen
        name={TabRoute.Favorites}
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Избранное', tabBarIcon: renderFavoritesIcon }}
      />
      <Tab.Screen
        name={TabRoute.Profile}
        component={ProfileScreen}
        options={{ tabBarLabel: 'Профиль', tabBarIcon: renderProfileIcon }}
      />
    </Tab.Navigator>
  );
}
