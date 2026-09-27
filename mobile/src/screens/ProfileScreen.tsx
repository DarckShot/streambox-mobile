import { useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STREAMBOX_COLORS } from '../constants/theme';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

export const ProfileScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={styles.eyebrow}>Личное пространство</Text>
      <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate(RootRoute.History)}
        style={[
          styles.link,
          { backgroundColor: dark ? STREAMBOX_COLORS.glowDark : STREAMBOX_COLORS.white },
        ]}
      >
        <Text style={[styles.linkTitle, { color: colors.text }]}>История просмотра</Text>
        <Text
          style={[
            styles.linkDescription,
            { color: dark ? STREAMBOX_COLORS.descriptionDark : STREAMBOX_COLORS.descriptionLight },
          ]}
        >
          Недавно просмотренные видео и прогресс
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 22 },
  eyebrow: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1.1, lineHeight: 40, marginTop: 8 },
  link: { marginTop: 28, borderRadius: 18, padding: 20, gap: 6 },
  linkTitle: { fontSize: 18, fontWeight: '800' },
  linkDescription: { fontSize: 14 },
});
