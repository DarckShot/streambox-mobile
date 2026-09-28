import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ApiError } from '../../api/client';
import { videoDetailsScreenStyles as styles } from '../../screens/VideoDetailsScreen.styles';
import { VideoPlaceholderIcon } from '../icons/VideoPlaceholderIcon';

const SAFE_AREA_EDGES: Edge[] = ['left', 'right', 'bottom'];

interface VideoDetailsStateProps {
  backgroundColor: string;
  dark: boolean;
  error?: Error | null;
  loading?: boolean;
  online: boolean;
  onBack: () => void;
  onRetry: () => void;
  textColor: string;
}

export const VideoDetailsState = ({
  backgroundColor,
  dark,
  error,
  loading = false,
  online,
  onBack,
  onRetry,
  textColor,
}: VideoDetailsStateProps): ReactElement => {
  const notFound = error instanceof ApiError && error.kind === 'not-found';

  return (
    <SafeAreaView edges={SAFE_AREA_EDGES} style={[styles.errorScreen, { backgroundColor }]}>
      {loading ? (
        <>
          {online ? <ActivityIndicator size="large" color="#7C5CFC" /> : null}
          <Text style={{ color: textColor }}>
            {online ? 'Загружаем видео…' : 'Нет подключения. Данные видео пока не сохранены.'}
          </Text>
        </>
      ) : (
        <View style={[styles.errorCard, dark ? styles.surfaceDark : styles.surfaceLight]}>
          <View style={styles.errorIcon}>
            <VideoPlaceholderIcon color="#A89AFD" size={52} />
          </View>
          <Text style={[styles.errorTitle, { color: textColor }]}>
            {notFound ? 'Видео не найдено' : 'Не удалось загрузить видео'}
          </Text>
          <Text style={[styles.errorDescription, dark ? styles.textDark : styles.textLight]}>
            {error?.message ?? 'Попробуйте загрузить видео ещё раз.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [styles.errorBackButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.errorBackButtonText}>Назад к каталогу</Text>
          </Pressable>
          {!notFound ? (
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.errorBackButton}>
              <Text style={styles.errorBackButtonText}>Повторить</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
};
