import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, type ReactElement } from 'react';
import { Alert } from 'react-native';

import { HistoryView } from '../components/history/HistoryView';
import { useHistoryItems } from '../hooks/useHistoryItems';
import { useClearUserData } from '../hooks/useUserData';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

export const HistoryScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const history = useHistoryItems();
  const { mutate: clearHistory, isPending: isClearing } = useClearUserData(history.userId).history;

  const openVideo = useCallback(
    (videoId: string): void => navigation.navigate(RootRoute.VideoDetails, { videoId }),
    [navigation],
  );
  const removeHistory = useCallback((): void => {
    clearHistory(undefined, {
      onError: () =>
        Alert.alert('Не удалось очистить историю', 'Проверьте соединение и повторите.'),
    });
  }, [clearHistory]);
  const confirmClear = useCallback((): void => {
    Alert.alert('Очистить историю?', 'Все записи о просмотренных видео будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: removeHistory },
    ]);
  }, [removeHistory]);

  return (
    <HistoryView
      items={history.items}
      recordCount={history.recordCount}
      loading={history.loading}
      videosLoading={history.videosLoading}
      error={history.error}
      videosError={history.videosError}
      isClearing={isClearing}
      onClear={confirmClear}
      onOpenVideo={openVideo}
      onRetry={history.retry}
    />
  );
};
