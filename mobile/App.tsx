import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LINKING_OPTIONS } from './src/navigation/linking';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useFavoritesStore } from './src/store/useFavoritesStore';
import { useWatchHistoryStore } from './src/store/useWatchHistoryStore';
import { ApiError } from './src/api/client';
import { useSavedProgressStore } from './src/store/useSavedProgressStore';
import { usePlaybackSettingsStore } from './src/store/usePlaybackSettingsStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (attempt, error) =>
        attempt < 2 &&
        !(
          error instanceof ApiError &&
          ['not-found', 'invalid-request', 'invalid-response'].includes(error.kind)
        ),
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    useFavoritesStore.getState().loadFavorites();
    useWatchHistoryStore.getState().loadHistory();
    useSavedProgressStore.getState().loadProgress();
    usePlaybackSettingsStore.getState().loadSettings();
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <QueryClientProvider client={queryClient}>
        <NavigationContainer
          linking={LINKING_OPTIONS}
          theme={isDarkMode ? DarkTheme : DefaultTheme}
        >
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;
