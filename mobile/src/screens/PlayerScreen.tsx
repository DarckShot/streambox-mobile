import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, RootRoute.Player>;

export const PlayerScreen = ({ route }: PlayerScreenProps): ReactElement => (
  <PlaceholderScreen
    eyebrow="Просмотр"
    title="Плеер"
    description="Базовое воспроизведение и собственные элементы управления появятся на следующих этапах."
    detail={`Видео: ${route.params.videoId}`}
  />
);
