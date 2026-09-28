import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/api/queryClient';
import { AuthProvider } from './src/auth/AuthProvider';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { AppNavigation } from './src/navigation/AppNavigation';
import { OfflineBanner } from './src/components/network/OfflineBanner';

export { queryClient } from './src/api/queryClient';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  useAppInitialization();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineBanner>
            <AppNavigation dark={isDarkMode} />
          </OfflineBanner>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;
