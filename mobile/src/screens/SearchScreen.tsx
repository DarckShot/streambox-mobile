import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useCallback, type ReactElement } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { SearchIcon } from '../components/icons/SearchIcon';
import { TabSafeAreaView } from '../components/layout/TabSafeAreaView';
import { videoQueries } from '../api/videoQueries';
import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';
import VideoCard from '../components/video/VideoCard';
import { STREAMBOX_COLORS } from '../constants/theme';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { RootRoute, TabRoute } from '../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useSearchStore } from '../store/useSearchStore';
import type { Video } from '../types/video';
import { searchScreenStyles as styles } from './SearchScreen.styles';
import { useOnline } from '../services/networkState';

type SearchNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Search>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SEARCH_DEBOUNCE_MS = 250;
const keyExtractor = (video: Video): string => video.id;
const ItemSeparator = (): ReactElement => <View style={styles.separator} />;

export const SearchScreen = (): ReactElement => {
  const navigation = useNavigation<SearchNavigation>();
  const { colors, dark } = useTheme();
  const online = useOnline();
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const clearQuery = useSearchStore((state) => state.clearQuery);
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, SEARCH_DEBOUNCE_MS);
  const isWaiting = normalizedQuery !== debouncedQuery;
  const {
    data: results = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    ...videoQueries.list(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const handleVideoPress = useCallback(
    (videoId: string): void => navigation.navigate(RootRoute.VideoDetails, { videoId }),
    [navigation],
  );

  const renderVideo = useCallback(
    ({ item }: ListRenderItemInfo<Video>): ReactElement => (
      <VideoCard
        id={item.id}
        title={item.title}
        thumbnailUrl={item.thumbnailUrl}
        category={item.category}
        duration={item.duration}
        isDark={dark}
        textColor={colors.text}
        onPress={handleVideoPress}
      />
    ),
    [colors.text, dark, handleVideoPress],
  );

  return (
    <TabSafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Исследуйте</Text>
        <Text style={[styles.title, { color: colors.text }]}>Поиск</Text>
        <Text style={[styles.subtitle, dark ? styles.subtitleDark : styles.subtitleLight]}>
          Найдите видео по названию
        </Text>
        <View style={[styles.inputContainer, dark ? styles.inputDark : styles.inputLight]}>
          <SearchIcon color={STREAMBOX_COLORS.accent} focused={false} size={22} />
          <TextInput
            accessibilityLabel="Поиск видео"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Введите название видео"
            placeholderTextColor={
              dark ? STREAMBOX_COLORS.descriptionDark : STREAMBOX_COLORS.descriptionLight
            }
            returnKeyType="search"
            style={[styles.input, { color: colors.text }]}
            value={query}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityLabel="Очистить поиск"
              accessibilityRole="button"
              onPress={clearQuery}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: colors.text }]}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {normalizedQuery.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Что хотите посмотреть?</Text>
          <Text
            style={[styles.stateDescription, dark ? styles.subtitleDark : styles.subtitleLight]}
          >
            Введите название видео, чтобы найти его в каталоге.
          </Text>
        </View>
      ) : !online && isPending ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Нет подключения</Text>
          <Text style={{ color: colors.text }}>
            Поиск станет доступен после восстановления сети.
          </Text>
        </View>
      ) : isWaiting || isPending ? (
        <View style={styles.centerState}>
          <Text style={{ color: colors.text }}>Ищем видео…</Text>
        </View>
      ) : isError && results.length === 0 ? (
        <View style={styles.centerState}>
          <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
            Не удалось выполнить поиск
          </Text>
          <Text style={[styles.stateDescription, { color: colors.text }]}>{error.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={styles.clearButton}
          >
            <Text style={{ color: STREAMBOX_COLORS.accent }}>Повторить</Text>
          </Pressable>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Ничего не найдено</Text>
          <Text
            style={[styles.stateDescription, dark ? styles.subtitleDark : styles.subtitleLight]}
          >
            Попробуйте другое название или проверьте написание.
          </Text>
        </View>
      ) : (
        <ScrollEdgeBlur>
          <FlashList
            contentContainerStyle={styles.listContent}
            contentInsetAdjustmentBehavior="never"
            data={results}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            renderItem={renderVideo}
            showsVerticalScrollIndicator={false}
          />
        </ScrollEdgeBlur>
      )}
    </TabSafeAreaView>
  );
};
