import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

import type { ProfileSummary } from '../../hooks/useProfileSummary';
import { profileScreenStyles as styles } from './profileStyles';

interface ProfileStatsProps {
  compact: boolean;
  isDark: boolean;
  summary: ProfileSummary;
}

interface ProfileStatProps {
  compact: boolean;
  count: number | null;
  isDark: boolean;
  label: string;
}

const ProfileStat = ({ compact, count, isDark, label }: ProfileStatProps): ReactElement => (
  <View
    accessible
    accessibilityLabel={`${count === null ? 'Загрузка' : count} ${label}`}
    style={[
      styles.stat,
      compact ? styles.statCompact : null,
      isDark ? styles.surfaceDark : styles.surfaceLight,
    ]}
  >
    <Text style={[styles.statCount, compact ? styles.statCountCompact : null]}>
      {count === null ? '—' : count}
    </Text>
    <Text
      style={[
        styles.statLabel,
        compact ? styles.statLabelCompact : null,
        isDark ? styles.secondaryDark : styles.secondaryLight,
      ]}
    >
      {label}
    </Text>
  </View>
);

export const ProfileStats = ({ compact, isDark, summary }: ProfileStatsProps): ReactElement => (
  <>
    <View style={[styles.stats, compact ? styles.statsCompact : null]}>
      <ProfileStat
        compact={compact}
        count={summary.favorites}
        isDark={isDark}
        label="в избранном"
      />
      <ProfileStat compact={compact} count={summary.watched} isDark={isDark} label="просмотрено" />
    </View>
    <View style={[styles.progressStat, compact ? styles.progressStatCompact : null]}>
      <ProfileStat
        compact={compact}
        count={summary.inProgress}
        isDark={isDark}
        label="с сохранённым прогрессом"
      />
    </View>
  </>
);
