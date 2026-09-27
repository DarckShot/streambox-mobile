import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import VideoCard from '../components/video/VideoCard';
import { ImportVideoModal } from '../components/video/ImportVideoModal';
import { ContinueWatching } from '../components/video/ContinueWatching';
import { videoQueries } from '../api/videoQueries';
import { STREAMBOX_COLORS } from '../constants/theme';
import { RootRoute, TabRoute } from '../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { Video } from '../types/video';
import { homeScreenStyles as styles } from './HomeScreen.styles';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Home>,
  NativeStackNavigationProp<RootStackParamList>
>;

const keyExtractor = (video: Video): string => video.id;

const ItemSeparator = (): ReactElement => <View style={styles.separator} />;

const HomeHeader = ({ onImportPress }: { onImportPress: () => void }): ReactElement => {
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

export const HomeScreen = (): ReactElement => {
  const navigation = useNavigation<HomeNavigation>();
  const { colors, dark } = useTheme();
  const [showImport, setShowImport] = useState(false);
  const {
    data: videos = [],
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery(videoQueries.list());

  const handleVideoPress = useCallback(
    (videoId: string): void => {
      navigation.navigate(RootRoute.VideoDetails, { videoId });
    },
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {isPending ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={STREAMBOX_COLORS.accent} size="large" />
          <Text style={{ color: colors.text }}>Загружаем каталог…</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerState}>
          <Text accessibilityRole="alert" style={[styles.stateTitle, { color: colors.text }]}>
            Не удалось загрузить каталог
          </Text>
          <Text style={{ color: colors.text }}>{error.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Повторить</Text>
          </Pressable>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Каталог пока пуст</Text>
          <Text style={{ color: colors.text }}>Добавьте первое видео RUTUBE.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowImport(true)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Добавить видео</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>{isRefetching ? 'Обновляем…' : 'Обновить'}</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          data={videos}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={keyExtractor}
          renderItem={renderVideo}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<HomeHeader onImportPress={() => setShowImport(true)} />}
        />
      )}
      <ImportVideoModal
        onClose={() => setShowImport(false)}
        onImported={(video) => navigation.navigate(RootRoute.VideoDetails, { videoId: video.id })}
        visible={showImport}
      />
    </View>
  );
};
