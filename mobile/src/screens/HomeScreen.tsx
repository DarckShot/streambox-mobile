import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { Text, View } from 'react-native';

import VideoCard from '../components/video/VideoCard';
import { VIDEO_CATALOG } from '../constants/videoCatalog';
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

const HomeHeader = (): ReactElement => {
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
    </View>
  );
};

export const HomeScreen = (): ReactElement => {
  const navigation = useNavigation<HomeNavigation>();
  const { colors, dark } = useTheme();

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
      <FlashList
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        data={VIDEO_CATALOG}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
        renderItem={renderVideo}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={HomeHeader}
      />
    </View>
  );
};
