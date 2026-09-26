import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LINKING_OPTIONS } from './src/navigation/linking';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useFavoritesStore } from './src/store/useFavoritesStore';

const queryClient = new QueryClient();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    useFavoritesStore.getState().loadFavorites();
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
