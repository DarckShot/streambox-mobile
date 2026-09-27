import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { LINKING_OPTIONS } from './linking';
import { RootNavigator } from './RootNavigator';
import { usePendingPrivateLink } from './usePendingPrivateLink';
import { appNavigationStyles as styles } from './AppNavigation.styles';

interface AppNavigationProps {
  dark: boolean;
}

export const AppNavigation = ({ dark }: AppNavigationProps): ReactElement => {
  const { status, retryRestore, logout, migrationStatus } = useAuth();
  usePendingPrivateLink(status);

  if (status === 'restoring') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (status === 'restore-error') {
    return <SessionRestoreError dark={dark} onRetry={retryRestore} onLogout={logout} />;
  }
  return (
    <View style={styles.app}>
      <NavigationContainer
        key={status}
        linking={LINKING_OPTIONS}
        theme={dark ? DarkTheme : DefaultTheme}
      >
        <RootNavigator />
      </NavigationContainer>
      {status === 'authenticated' && migrationStatus === 'running' ? <MigrationOverlay /> : null}
    </View>
  );
};

const SessionRestoreError = ({
  dark,
  onRetry,
  onLogout,
}: {
  dark: boolean;
  onRetry: () => void;
  onLogout: () => Promise<void>;
}): ReactElement => {
  const colors = dark ? DarkTheme.colors : DefaultTheme.colors;
  return (
    <View style={[styles.centered, styles.restoreError]}>
      <Text style={{ color: colors.text }}>Не удалось восстановить сессию</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={{ color: colors.primary }}>Повторить</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onLogout}>
        <Text style={{ color: colors.primary }}>Войти заново</Text>
      </Pressable>
    </View>
  );
};

const MigrationOverlay = (): ReactElement => (
  <View style={styles.migrationOverlay}>
    <ActivityIndicator color="#FFFFFF" size="large" />
    <Text style={styles.migrationText}>Переносим сохранённые данные…</Text>
  </View>
);
