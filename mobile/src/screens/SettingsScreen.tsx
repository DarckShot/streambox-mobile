import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsDataSection } from '../components/settings/SettingsDataSection';
import { SettingsPlaybackSection } from '../components/settings/SettingsPlaybackSection';
import { settingsScreenStyles as styles } from '../components/settings/settingsStyles';
import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';

export const SettingsScreen = (): ReactElement => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollEdgeBlur>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>Параметры приложения</Text>
          <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>
          <SettingsPlaybackSection />
          <SettingsDataSection />
        </ScrollView>
      </ScrollEdgeBlur>
    </SafeAreaView>
  );
};
