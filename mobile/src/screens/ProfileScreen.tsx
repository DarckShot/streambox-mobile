import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileMenu } from '../components/profile/ProfileMenu';
import { profileScreenStyles as styles } from '../components/profile/profileStyles';
import { ProfileStats } from '../components/profile/ProfileStats';
import { useProfileSummary } from '../hooks/useProfileSummary';

export const ProfileScreen = (): ReactElement => {
  const { colors, dark } = useTheme();
  const { height } = useWindowDimensions();
  const compact = height < 740;
  const summary = useProfileSummary();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.content, compact ? styles.contentCompact : null]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Личное пространство</Text>
          <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
        </View>

        <ProfileStats compact={compact} isDark={dark} summary={summary} />

        {summary.isEmpty ? (
          <View
            style={[
              styles.emptyState,
              compact ? styles.emptyStateCompact : null,
              dark ? styles.emptyDark : styles.emptyLight,
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Пока нет сохранённых видео
            </Text>
            {!compact ? (
              <Text
                style={[
                  styles.emptyDescription,
                  dark ? styles.secondaryDark : styles.secondaryLight,
                ]}
              >
                Добавьте видео в избранное или начните просмотр — здесь появится ваша активность.
              </Text>
            ) : null}
          </View>
        ) : null}

        <ProfileMenu compact={compact} isDark={dark} textColor={colors.text} />
      </View>
    </SafeAreaView>
  );
};
