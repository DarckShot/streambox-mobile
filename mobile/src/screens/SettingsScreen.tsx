import { useTheme } from '@react-navigation/native';
import { type ReactElement } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';
import { StreamboxSwitch } from '../components/controls/StreamboxSwitch';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { usePlaybackSettingsStore } from '../store/usePlaybackSettingsStore';
import { useSavedProgressStore } from '../store/useSavedProgressStore';
import { useWatchHistoryStore } from '../store/useWatchHistoryStore';
import { settingsScreenStyles as styles } from './SettingsScreen.styles';

const confirmClear = (title: string, message: string, action: () => void): void => {
  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Удалить', style: 'destructive', onPress: action },
  ]);
};

interface ClearRowProps {
  description: string;
  disabled: boolean;
  onPress: () => void;
  title: string;
}

const ClearRow = ({ description, disabled, onPress, title }: ClearRowProps): ReactElement => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.row,
      pressed ? styles.pressed : null,
      disabled ? styles.disabled : null,
    ]}
  >
    <View style={styles.rowContent}>
      <Text style={styles.danger}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

export const SettingsScreen = (): ReactElement => {
  const { colors, dark } = useTheme();
  const autoPlayOnResume = usePlaybackSettingsStore((state) => state.autoPlayOnResume);
  const settingsLoaded = usePlaybackSettingsStore((state) => state.loaded);
  const setAutoPlayOnResume = usePlaybackSettingsStore((state) => state.setAutoPlayOnResume);
  const historyCount = useWatchHistoryStore((state) => state.entries.length);
  const historyLoaded = useWatchHistoryStore((state) => state.loaded);
  const clearHistory = useWatchHistoryStore((state) => state.clearHistory);
  const progressCount = useSavedProgressStore((state) => Object.keys(state.positions).length);
  const progressLoaded = useSavedProgressStore((state) => state.loaded);
  const clearProgress = useSavedProgressStore((state) => state.clearProgress);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);
  const favoritesLoaded = useFavoritesStore((state) => state.status === 'ready');
  const favoritesSaving = useFavoritesStore((state) => state.isSaving);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollEdgeBlur>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>Параметры приложения</Text>
          <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>

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

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои данные</Text>
          <Text style={styles.sectionDescription}>
            Удаление данных нельзя отменить. Каждый раздел очищается отдельно.
          </Text>
          <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
            <ClearRow
              title="Очистить историю"
              description={`Просмотрено: ${historyCount}`}
              disabled={!historyLoaded || historyCount === 0}
              onPress={() =>
                confirmClear(
                  'Очистить историю?',
                  'Все записи о просмотренных видео будут удалены.',
                  clearHistory,
                )
              }
            />
            <View style={styles.divider} />
            <ClearRow
              title="Сбросить прогресс"
              description={`Видео с сохранённой позицией: ${progressCount}`}
              disabled={!progressLoaded || progressCount === 0}
              onPress={() =>
                confirmClear(
                  'Сбросить прогресс?',
                  'Сохранённые позиции всех видео будут удалены.',
                  () => {
                    clearProgress().catch(console.warn);
                  },
                )
              }
            />
            <View style={styles.divider} />
            <ClearRow
              title="Очистить избранное"
              description={`Видео в избранном: ${favoriteCount}`}
              disabled={!favoritesLoaded || favoritesSaving || favoriteCount === 0}
              onPress={() =>
                confirmClear(
                  'Очистить избранное?',
                  'Все видео будут удалены из избранного.',
                  () => {
                    clearFavorites().catch(console.warn);
                  },
                )
              }
            />
          </View>
        </ScrollView>
      </ScrollEdgeBlur>
    </SafeAreaView>
  );
};
