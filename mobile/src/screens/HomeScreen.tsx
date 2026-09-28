import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState, type ReactElement } from 'react';
import { View } from 'react-native';

import { HomeCatalog } from '../components/home/HomeCatalog';
import { ImportVideoModal } from '../components/video/ImportVideoModal';
import { RootRoute, TabRoute } from '../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { homeScreenStyles as styles } from './HomeScreen.styles';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Home>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen = (): ReactElement => {
  const navigation = useNavigation<HomeNavigation>();
  const { colors } = useTheme();
  const [showImport, setShowImport] = useState(false);
  const openImport = useCallback((): void => setShowImport(true), []);
  const closeImport = useCallback((): void => setShowImport(false), []);
  const openVideo = useCallback(
    (videoId: string): void => navigation.navigate(RootRoute.VideoDetails, { videoId }),
    [navigation],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <HomeCatalog onImport={openImport} onVideoPress={openVideo} />
      <ImportVideoModal
        onClose={closeImport}
        onImported={(video) => openVideo(video.id)}
        visible={showImport}
      />
    </View>
  );
};
