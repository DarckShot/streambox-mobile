import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, type ReactElement } from 'react';
import { Text, View } from 'react-native';

import { FavoritesContent } from '../components/favorites/FavoritesContent';
import { TabSafeAreaView } from '../components/layout/TabSafeAreaView';
import { useFavoritesCatalog } from '../hooks/useFavoritesCatalog';
import { RootRoute, TabRoute } from '../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { favoritesScreenStyles as styles } from './FavoritesScreen.styles';

type FavoritesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Favorites>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const FavoritesScreen = (): ReactElement => {
  const navigation = useNavigation<FavoritesNavigation>();
  const { colors, dark } = useTheme();
  const catalog = useFavoritesCatalog();
  const openVideo = useCallback(
    (videoId: string): void => navigation.navigate(RootRoute.VideoDetails, { videoId }),
    [navigation],
  );
  const browse = useCallback((): void => navigation.navigate(TabRoute.Home), [navigation]);

  return (
    <TabSafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Ваша коллекция</Text>
        <Text style={[styles.title, { color: colors.text }]}>Избранное</Text>
        {catalog.status === 'ready' ? (
          <Text style={[styles.subtitle, dark ? styles.subtitleDark : styles.subtitleLight]}>
            Сохранено видео: {catalog.favoriteCount}
          </Text>
        ) : null}
      </View>
      <FavoritesContent
        catalog={catalog}
        dark={dark}
        onBrowse={browse}
        onVideoPress={openVideo}
        textColor={colors.text}
      />
    </TabSafeAreaView>
  );
};
