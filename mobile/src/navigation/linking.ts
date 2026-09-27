import { getStateFromPath, type LinkingOptions } from '@react-navigation/native';

import { RootRoute, ROUTE_PATHS, TabRoute } from './routes';
import type { RootStackParamList } from './types';

export const DEEP_LINK_PREFIXES = ['streambox://'];

/** Карта путей, используемая корневым контейнером React Navigation. */
export const LINKING_CONFIG: NonNullable<LinkingOptions<RootStackParamList>['config']> = {
  initialRouteName: RootRoute.Main,
  screens: {
    [RootRoute.Main]: {
      initialRouteName: TabRoute.Home,
      screens: {
        [TabRoute.Home]: { path: ROUTE_PATHS.HOME, alias: ['home'] },
        [TabRoute.Search]: ROUTE_PATHS.SEARCH,
        [TabRoute.Favorites]: ROUTE_PATHS.FAVORITES,
        [TabRoute.Profile]: ROUTE_PATHS.PROFILE,
      },
    },
    [RootRoute.VideoDetails]: ROUTE_PATHS.VIDEO_DETAILS,
    [RootRoute.Player]: ROUTE_PATHS.PLAYER,
    [RootRoute.History]: { path: ROUTE_PATHS.HISTORY, alias: ['history'] },
    [RootRoute.Settings]: { path: ROUTE_PATHS.SETTINGS, alias: ['profile/settings'] },
  },
};

export const LINKING_OPTIONS: LinkingOptions<RootStackParamList> = {
  prefixes: DEEP_LINK_PREFIXES,
  config: LINKING_CONFIG,
  getStateFromPath: (path, config) => {
    try {
      return getStateFromPath(path, config) ?? getStateFromPath('', config);
    } catch {
      return getStateFromPath('', config);
    }
  },
};
