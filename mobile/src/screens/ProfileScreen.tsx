import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { ProfileMenu } from '../components/profile/ProfileMenu';
import { TabSafeAreaView } from '../components/layout/TabSafeAreaView';
import { profileScreenStyles as styles } from '../components/profile/profileStyles';
import { ProfileStats } from '../components/profile/ProfileStats';
import { useProfileSummary } from '../hooks/useProfileSummary';
import { useCurrentUser } from '../hooks/useUserData';
import { useAuth } from '../auth/AuthProvider';
import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';

export const ProfileScreen = (): ReactElement => {
  const { colors, dark } = useTheme();
  const { height } = useWindowDimensions();
  const compact = height < 740;
  const summary = useProfileSummary();
  const user = useCurrentUser();
  const { logout, migrationStatus, retryMigration } = useAuth();

  return (
    <TabSafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollEdgeBlur>
        <ScrollView
          contentContainerStyle={[styles.content, compact ? styles.contentCompact : null]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Личное пространство</Text>
            <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
            <Text style={[styles.emptyDescription, { color: colors.text }]}>
              {user.data?.email ?? 'Загружаем аккаунт…'}
            </Text>
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
          {migrationStatus === 'error' ? (
            <Pressable
              accessibilityRole="button"
              onPress={retryMigration}
              style={styles.migrationAction}
            >
              <Text style={{ color: colors.primary }}>
                Не удалось перенести старые данные. Повторить
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => logout()}
            style={styles.logoutAction}
          >
            <Text style={[styles.logoutText, { color: colors.primary }]}>Выйти из аккаунта</Text>
          </Pressable>
        </ScrollView>
      </ScrollEdgeBlur>
    </TabSafeAreaView>
  );
};
