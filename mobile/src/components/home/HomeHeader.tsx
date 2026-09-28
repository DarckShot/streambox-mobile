import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { homeScreenStyles as styles } from '../../screens/HomeScreen.styles';
import { ContinueWatching } from '../video/ContinueWatching';

export const HomeHeader = ({ onImportPress }: { onImportPress: () => void }): ReactElement => {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark} />
        <Text style={styles.brand}>STREAMBOX</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Смотреть сейчас</Text>
      <Text style={[styles.subtitle, dark ? styles.subtitleDark : styles.subtitleLight]}>
        Истории, знания и впечатления — выберите видео для просмотра.
      </Text>
      <Pressable accessibilityRole="button" onPress={onImportPress} style={styles.importButton}>
        <Text style={styles.importButtonText}>+ Добавить видео RUTUBE</Text>
      </Pressable>
      <ContinueWatching />
    </View>
  );
};
