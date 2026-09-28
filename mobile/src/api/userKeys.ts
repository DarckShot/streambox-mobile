export const userKeys = {
  me: ['session', 'me'],
  favorites: (userId: string) => ['users', userId, 'favorites'],
  history: (userId: string) => ['users', userId, 'history'],
  progress: (userId: string) => ['users', userId, 'progress'],
  videoProgress: (userId: string, videoId: string) => ['users', userId, 'progress', videoId],
};
