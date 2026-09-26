import { useTheme } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState, type ReactElement } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { HeartIcon } from '../components/icons/HeartIcon';
import { VideoPlaceholderIcon } from '../components/icons/VideoPlaceholderIcon';
import RutubeVideoPlayer from '../components/player/RutubeVideoPlayer';
import { VIDEO_CATALOG } from '../constants/videoCatalog';
import { STREAMBOX_COLORS } from '../constants/theme';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { videoDetailsScreenStyles as styles } from './VideoDetailsScreen.styles';

type VideoDetailsScreenProps = NativeStackScreenProps<RootStackParamList, RootRoute.VideoDetails>;

const VIDEO_DETAILS_SAFE_AREA_EDGES: Edge[] = ['left', 'right', 'bottom'];

export const VideoDetailsScreen = ({
  navigation,
  route,
}: VideoDetailsScreenProps): ReactElement => {
  const { colors, dark } = useTheme();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isCompact = height < 760 || isLandscape;
  const titleLineLimit = isCompact ? 1 : 2;
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const playerHeight = Math.min(width * (9 / 16), height * 0.29);
  const portraitPlayerStyle = useMemo(
    () => [styles.playerPortrait, { height: playerHeight }],
    [playerHeight],
  );

  const video = VIDEO_CATALOG.find((item) => item.id === route.params.videoId);

  const handleFavoritePress = (): void => {
    // Здесь пользователь позже подключит логику избранного.
  };

  if (!video) {
    return (
      <SafeAreaView
        edges={VIDEO_DETAILS_SAFE_AREA_EDGES}
        style={[styles.errorScreen, { backgroundColor: colors.background }]}
      >
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
            style={({ pressed }) => [styles.errorBackButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.errorBackButtonText}>Назад к каталогу</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={VIDEO_DETAILS_SAFE_AREA_EDGES}
      style={[
        styles.screen,
        isLandscape ? styles.screenLandscape : null,
        { backgroundColor: colors.background },
      ]}
    >
      <RutubeVideoPlayer
        containerStyle={isLandscape ? styles.playerLandscape : portraitPlayerStyle}
        externalId={video.externalId}
        posterUrl={video.thumbnailUrl}
      />

      <ScrollView
        style={styles.detailsScroll}
        contentContainerStyle={[styles.details, isCompact ? styles.detailsCompact : null]}
      >
        <View style={styles.categoryRow}>
          <View style={styles.categoryMark} />
          <Text style={styles.category}>{video.category}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text
            accessible={false}
            importantForAccessibility="no"
            onTextLayout={(event) => {
              setIsTitleOverflowing(event.nativeEvent.lines.length > titleLineLimit);
            }}
            style={[styles.title, isCompact ? styles.titleCompact : null, styles.titleMeasure]}
          >
            {video.title}
          </Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={isTitleExpanded ? undefined : titleLineLimit}
            style={[styles.title, isCompact ? styles.titleCompact : null, { color: colors.text }]}
          >
            {video.title}
          </Text>
          {isTitleOverflowing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isTitleExpanded }}
              onPress={() => setIsTitleExpanded((expanded) => !expanded)}
              style={styles.titleToggle}
            >
              <Text style={styles.titleToggleText}>
                {isTitleExpanded ? 'Свернуть' : 'Показать полностью'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, dark ? styles.textDark : styles.textLight]}>
            Длительность
          </Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{video.duration}</Text>
        </View>

        <View style={[styles.divider, dark ? styles.dividerDark : styles.dividerLight]} />

        <View style={[styles.descriptionBlock, isCompact ? styles.descriptionBlockCompact : null]}>
          <Text
            style={[
              styles.sectionTitle,
              isCompact ? styles.sectionTitleCompact : null,
              { color: colors.text },
            ]}
          >
            О видео
          </Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={isLandscape ? 3 : isCompact ? 2 : 4}
            style={[
              styles.description,
              isCompact ? styles.descriptionCompact : null,
              dark ? styles.textDark : styles.textLight,
            ]}
          >
            {video.description}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityHint="Функция избранного будет подключена позже"
            accessibilityRole="button"
            onPress={handleFavoritePress}
            style={({ pressed }) => [
              styles.secondaryButton,
              isCompact ? styles.secondaryButtonCompact : null,
              dark ? styles.secondaryButtonDark : styles.secondaryButtonLight,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <HeartIcon color={STREAMBOX_COLORS.accent} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>В избранное</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
