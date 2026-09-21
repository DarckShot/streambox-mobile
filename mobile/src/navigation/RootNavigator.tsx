import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { HistoryScreen } from '../screens/HistoryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VideoDetailsScreen } from '../screens/VideoDetailsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RootRoute } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MAIN_OPTIONS: NativeStackNavigationOptions = { headerShown: false };
const VIDEO_DETAILS_OPTIONS: NativeStackNavigationOptions = { title: 'Video Details' };
const PLAYER_OPTIONS: NativeStackNavigationOptions = { title: 'Player' };
const HISTORY_OPTIONS: NativeStackNavigationOptions = { title: 'History' };
const SETTINGS_OPTIONS: NativeStackNavigationOptions = { title: 'Settings' };

export const RootNavigator = (): ReactElement => {
  return (
    <Stack.Navigator initialRouteName={RootRoute.Main}>
      <Stack.Screen name={RootRoute.Main} component={MainTabNavigator} options={MAIN_OPTIONS} />
      <Stack.Screen
        name={RootRoute.VideoDetails}
        component={VideoDetailsScreen}
        options={VIDEO_DETAILS_OPTIONS}
      />
      <Stack.Screen name={RootRoute.Player} component={PlayerScreen} options={PLAYER_OPTIONS} />
      <Stack.Screen name={RootRoute.History} component={HistoryScreen} options={HISTORY_OPTIONS} />
      <Stack.Screen
        name={RootRoute.Settings}
        component={SettingsScreen}
        options={SETTINGS_OPTIONS}
      />
    </Stack.Navigator>
  );
};
