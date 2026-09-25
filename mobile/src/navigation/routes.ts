export enum RootRoute {
  Main = 'Main',
  VideoDetails = 'VideoDetails',
  History = 'History',
  Settings = 'Settings',
}

export enum TabRoute {
  Home = 'Home',
  Search = 'Search',
  Favorites = 'Favorites',
  Profile = 'Profile',
}

export const ROUTE_PATHS = {
  HOME: '',
  SEARCH: 'search',
  VIDEO_DETAILS: 'videos/:videoId',
  FAVORITES: 'favorites',
  PROFILE: 'profile',
  HISTORY: 'profile/history',
  SETTINGS: 'settings',
};
