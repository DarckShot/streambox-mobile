import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

import { usePlaybackSettingsStore } from '../../store/usePlaybackSettingsStore';
import { StreamboxSwitch } from '../controls/StreamboxSwitch';
import { settingsScreenStyles as styles } from './settingsStyles';

export const SettingsPlaybackSection = (): ReactElement => {
  const { colors, dark } = useTheme();
  const autoPlayOnResume = usePlaybackSettingsStore((state) => state.autoPlayOnResume);
  const settingsLoaded = usePlaybackSettingsStore((state) => state.loaded);
  const setAutoPlayOnResume = usePlaybackSettingsStore((state) => state.setAutoPlayOnResume);

  return (
    <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Воспроизведение</Text>
      <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>
              Автозапуск при продолжении
            </Text>
            <Text style={styles.description}>
              Начинать воспроизведение автоматически с сохранённого места
            </Text>
          </View>
          <StreamboxSwitch
            accessibilityLabel="Автозапуск при продолжении"
            disabled={!settingsLoaded}
            isDark={dark}
            onValueChange={setAutoPlayOnResume}
            value={autoPlayOnResume}
          />
        </View>
      </View>
    </>
  );
};
