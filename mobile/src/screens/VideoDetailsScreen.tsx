import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { HeartIcon } from '../components/icons/HeartIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import { VideoPlaceholderIcon } from '../components/icons/VideoPlaceholderIcon';
import { VIDEO_CATALOG } from '../constants/videoCatalog';
import { STREAMBOX_COLORS } from '../constants/theme';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { videoDetailsScreenStyles as styles } from './VideoDetailsScreen.styles';

type VideoDetailsScreenProps = NativeStackScreenProps<RootStackParamList, RootRoute.VideoDetails>;

export const VideoDetailsScreen = ({
  navigation,
  route,
}: VideoDetailsScreenProps): ReactElement => {
  const { colors, dark } = useTheme();

  const videoId = route.params.videoId;
  const video = VIDEO_CATALOG.find((item) => item.id === videoId);

  const handleWatchPress = (): void => {
    navigation.navigate(RootRoute.Player, { videoId });
  };

  const handleFavoritePress = (): void => {
    // Здесь пользователь позже подключит логику избранного.
  };

  if (!video) {
    return (
      <View style={[styles.errorScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.errorCard, dark ? styles.surfaceDark : styles.surfaceLight]}>
          <View style={styles.errorIcon}>
            <VideoPlaceholderIcon color="#A89AFD" size={52} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Видео не найдено</Text>
          <Text style={[styles.errorDescription, dark ? styles.textDark : styles.textLight]}>
            Возможно, оно было удалено или ссылка устарела. Вернитесь в каталог и выберите другое
            видео.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={navigation.goBack}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.primaryButtonText}>Назад к каталогу</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.cover}>
        <View style={styles.coverFallback}>
          <VideoPlaceholderIcon color="#77738D" size={56} />
          <Text style={styles.coverFallbackText}>НЕТ ОБЛОЖКИ</Text>
        </View>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={{ uri: video.thumbnailUrl }}
          style={styles.coverImage}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryMark} />
          <Text style={styles.category}>{video.category}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{video.title}</Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, dark ? styles.textDark : styles.textLight]}>
            Длительность
          </Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{video.duration}</Text>
        </View>

        <View style={[styles.divider, dark ? styles.dividerDark : styles.dividerLight]} />

        <View style={styles.descriptionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>О видео</Text>
          <Text style={[styles.description, dark ? styles.textDark : styles.textLight]}>
            {video.description}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityHint="Плеер будет подключён позже"
            accessibilityRole="button"
            onPress={handleWatchPress}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.buttonPressed : null]}
          >
            <PlayIcon color={STREAMBOX_COLORS.white} />
            <Text style={styles.primaryButtonText}>Смотреть</Text>
          </Pressable>

          <Pressable
            accessibilityHint="Функция избранного будет подключена позже"
            accessibilityRole="button"
            onPress={handleFavoritePress}
            style={({ pressed }) => [
              styles.secondaryButton,
              dark ? styles.secondaryButtonDark : styles.secondaryButtonLight,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <HeartIcon color={STREAMBOX_COLORS.accent} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>В избранное</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};
