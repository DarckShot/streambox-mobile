import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { HistoryItem } from '../../types/history';
import { HistoryContent } from './HistoryContent';
import { historyScreenStyles as styles } from './historyStyles';

interface HistoryViewProps {
  items: HistoryItem[];
  recordCount: number;
  loading: boolean;
  videosLoading: boolean;
  error: string | null;
  videosError: Error | null;
  isClearing: boolean;
  onClear: () => void;
  onOpenVideo: (videoId: string) => void;
  onRetry: () => void;
}

export const HistoryView = ({
  items,
  recordCount,
  loading,
  videosLoading,
  error,
  videosError,
  isClearing,
  onClear,
  onOpenVideo,
  onRetry,
}: HistoryViewProps): ReactElement => {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Продолжите просмотр</Text>
        <Text style={[styles.title, { color: colors.text }]}>История</Text>
        {recordCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            disabled={isClearing}
            onPress={onClear}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Очистить историю</Text>
          </Pressable>
        ) : null}
      </View>
      {error && recordCount > 0 ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <HistoryContent
        items={items}
        recordCount={recordCount}
        loading={loading}
        videosLoading={videosLoading}
        error={error}
        videosError={videosError}
        onOpenVideo={onOpenVideo}
        onRetry={onRetry}
      />
    </View>
  );
};
