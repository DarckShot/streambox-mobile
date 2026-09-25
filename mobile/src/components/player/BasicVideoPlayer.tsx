import { memo, type ReactElement, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import type { BasicVideoPlayerStatus } from '../../types/player';
import { PlayIcon } from '../icons/PlayIcon';
import { VideoPlaceholderIcon } from '../icons/VideoPlaceholderIcon';
import { basicVideoPlayerStyles as styles } from './BasicVideoPlayer.styles';

interface BasicVideoPlayerProps {
  containerStyle?: StyleProp<ViewStyle>;
  status: BasicVideoPlayerStatus;
  posterUrl: string;
  media?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  errorActionLabel?: string;
  onPlaybackPress?: () => void;
  onErrorActionPress?: () => void;
}

const BasicVideoPlayer = ({
  containerStyle,
  status,
  posterUrl,
  media,
  errorTitle = 'Не удалось воспроизвести видео',
  errorDescription = 'Проверьте соединение и попробуйте ещё раз.',
  errorActionLabel = 'Повторить',
  onPlaybackPress,
  onErrorActionPress,
}: BasicVideoPlayerProps): ReactElement => {
  const isLoading = status === 'loading' || status === 'buffering';
  const isEnded = status === 'ended';
  const isError = status === 'error';
  const showPlaybackButton = status === 'idle' || isEnded;
  const showShade = status === 'idle' || status === 'loading' || isEnded || isError;

  return (
    <View style={[styles.frame, containerStyle]}>
      {media ??
        (posterUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: posterUrl }}
            style={styles.poster}
          />
        ) : null)}
      {showShade ? <View pointerEvents="none" style={styles.posterShade} /> : null}

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={STREAMBOX_COLORS.white} size="large" />
          <Text style={styles.stateLabel}>
            {status === 'buffering' ? 'Буферизация…' : 'Загрузка видео…'}
          </Text>
        </View>
      ) : null}

      {showPlaybackButton ? (
        <View style={styles.centerState}>
          <Pressable
            accessibilityLabel={isEnded ? 'Смотреть снова' : 'Смотреть'}
            accessibilityRole="button"
            onPress={onPlaybackPress}
            style={({ pressed }) => [
              styles.controlButton,
              pressed ? styles.controlButtonPressed : null,
            ]}
          >
            <PlayIcon color={STREAMBOX_COLORS.white} size={24} />
          </Pressable>
          {isEnded ? <Text style={styles.stateLabel}>Видео завершено</Text> : null}
        </View>
      ) : null}

      {isError ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <VideoPlaceholderIcon color="#A89AFD" size={36} />
          </View>
          <Text style={styles.errorTitle}>{errorTitle}</Text>
          <Text style={styles.errorDescription}>{errorDescription}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onErrorActionPress}
            style={({ pressed }) => [
              styles.errorButton,
              pressed ? styles.controlButtonPressed : null,
            ]}
          >
            <Text style={styles.errorButtonText}>{errorActionLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

export default memo(BasicVideoPlayer);
