import type { LinkingOptions } from '@react-navigation/native';

import { RootRoute, ROUTE_PATHS, TabRoute } from './routes';
import type { RootStackParamList } from './types';

export const DEEP_LINK_PREFIXES = ['streambox://'];

/** Карта путей, используемая корневым контейнером React Navigation. */
export const LINKING_CONFIG = {
  initialRouteName: RootRoute.Main,
  screens: {
    [RootRoute.Main]: {
      screens: {
        [TabRoute.Home]: ROUTE_PATHS.HOME,
        [TabRoute.Search]: ROUTE_PATHS.SEARCH,
        [TabRoute.Favorites]: ROUTE_PATHS.FAVORITES,
        [TabRoute.Profile]: ROUTE_PATHS.PROFILE,
      },
    },
    [RootRoute.VideoDetails]: ROUTE_PATHS.VIDEO_DETAILS,
    [RootRoute.Player]: ROUTE_PATHS.PLAYER,
    [RootRoute.History]: ROUTE_PATHS.HISTORY,
    [RootRoute.Settings]: ROUTE_PATHS.SETTINGS,
  },
};

export const LINKING_OPTIONS: LinkingOptions<RootStackParamList> = {
  prefixes: DEEP_LINK_PREFIXES,
  config: LINKING_CONFIG,
};
