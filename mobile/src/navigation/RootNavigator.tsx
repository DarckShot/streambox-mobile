import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { HistoryScreen } from '../screens/HistoryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VideoDetailsScreen } from '../screens/VideoDetailsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RootRoute } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName={RootRoute.Main}>
      <Stack.Screen
        name={RootRoute.Main}
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={RootRoute.VideoDetails}
        component={VideoDetailsScreen}
        options={{ title: 'Video Details' }}
      />
      <Stack.Screen
        name={RootRoute.Player}
        component={PlayerScreen}
        options={{ title: 'Player' }}
      />
      <Stack.Screen
        name={RootRoute.History}
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name={RootRoute.Settings}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
