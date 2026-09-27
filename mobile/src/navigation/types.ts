import type { NavigatorScreenParams } from '@react-navigation/native';

import { RootRoute, TabRoute } from './routes';

export type VideoRouteParams = {
  videoId: string;
};

export type RootStackParamList = {
  [RootRoute.Main]: NavigatorScreenParams<MainTabParamList> | undefined;
  [RootRoute.VideoDetails]: VideoRouteParams;
  [RootRoute.Player]: VideoRouteParams;
  [RootRoute.History]: undefined;
  [RootRoute.Settings]: undefined;
};

export type MainTabParamList = {
  [TabRoute.Home]: undefined;
  [TabRoute.Search]: undefined;
  [TabRoute.Favorites]: undefined;
  [TabRoute.Profile]: undefined;
};
