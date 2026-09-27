import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartIcon } from '../components/icons/HeartIcon';
import { ScrollEdgeBlur } from '../components/scroll/ScrollEdgeBlur';
import VideoCard from '../components/video/VideoCard';
import { STREAMBOX_COLORS } from '../constants/theme';
import { useVideosByIds } from '../hooks/useVideosByIds';
import { RootRoute, TabRoute } from '../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useUserCollections } from '../hooks/useUserData';
import type { Video } from '../types/video';
import { favoritesScreenStyles as styles } from './FavoritesScreen.styles';

type FavoritesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Favorites>,
  NativeStackNavigationProp<RootStackParamList>
>;

const keyExtractor = (video: Video): string => video.id;

const ItemSeparator = (): ReactElement => <View style={styles.separator} />;

export const FavoritesScreen = (): ReactElement => {
  const navigation = useNavigation<FavoritesNavigation>();
  const { colors, dark } = useTheme();
  const { favorites } = useUserCollections();
  const favoriteIds = favorites.data?.map((item) => item.videoId) ?? [];
  const status = favorites.isPending ? 'loading' : favorites.isError ? 'error' : 'ready';
  const error = favorites.error?.message ?? null;
  const loadFavorites = favorites.refetch;
  const errorColor = dark ? STREAMBOX_COLORS.errorDark : STREAMBOX_COLORS.errorLight;
  const {
    byId,
    isLoading: videosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useVideosByIds(favoriteIds);
  const favoriteVideos = favoriteIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));

  const handleVideoPress = useCallback(
    (videoId: string): void => {
      navigation.navigate(RootRoute.VideoDetails, { videoId });
    },
    [navigation],
  );

  const handleBrowsePress = useCallback((): void => {
    navigation.navigate(TabRoute.Home);
  }, [navigation]);

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
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Ваша коллекция</Text>
        <Text style={[styles.title, { color: colors.text }]}>Избранное</Text>
        {status === 'ready' ? (
          <Text style={[styles.subtitle, dark ? styles.subtitleDark : styles.subtitleLight]}>
            Сохранено видео: {favoriteIds.length}
          </Text>
        ) : null}
      </View>

      {status === 'loading' ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={STREAMBOX_COLORS.accent} size="large" />
          <Text style={[styles.stateDescription, { color: colors.text }]}>
            Загружаем избранное…
          </Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Не удалось открыть избранное
          </Text>
          <Text
            style={[styles.stateDescription, dark ? styles.subtitleDark : styles.subtitleLight]}
          >
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => loadFavorites()}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Повторить</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'ready' && favoriteIds.length > 0 && videosLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={STREAMBOX_COLORS.accent} size="large" />
          <Text style={{ color: colors.text }}>Загружаем видео…</Text>
        </View>
      ) : null}

      {status === 'ready' && videosError && !videosLoading && favoriteVideos.length === 0 ? (
        <View style={styles.centerState}>
          <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
            Не удалось загрузить избранное
          </Text>
          <Text style={{ color: colors.text }}>{videosError.message}</Text>
          <Pressable accessibilityRole="button" onPress={refetchVideos} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Повторить</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'ready' && favoriteIds.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <HeartIcon color={STREAMBOX_COLORS.accent} size={42} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Здесь пока пусто</Text>
          <Text
            style={[styles.stateDescription, dark ? styles.subtitleDark : styles.subtitleLight]}
          >
            Откройте видео и нажмите «В избранное» — оно появится здесь.
          </Text>
          {error ? (
            <Text accessibilityRole="alert" style={[styles.errorBanner, { color: errorColor }]}>
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={handleBrowsePress}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Смотреть каталог</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'ready' && favoriteVideos.length > 0 ? (
        <>
          {error ? (
            <Text accessibilityRole="alert" style={[styles.errorBanner, { color: errorColor }]}>
              {error}
            </Text>
          ) : null}
          <ScrollEdgeBlur>
            <FlashList
              contentContainerStyle={styles.listContent}
              contentInsetAdjustmentBehavior="never"
              data={favoriteVideos}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={keyExtractor}
              renderItem={renderVideo}
              showsVerticalScrollIndicator={false}
            />
          </ScrollEdgeBlur>
        </>
      ) : null}
    </SafeAreaView>
  );
};
