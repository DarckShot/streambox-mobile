import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

type VideoDetailsScreenProps = NativeStackScreenProps<RootStackParamList, RootRoute.VideoDetails>;

export function VideoDetailsScreen({ route }: VideoDetailsScreenProps): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="О видео"
      title="Детали"
      description="Описание, метаданные и переход к просмотру будут добавлены позже."
      detail={`Видео: ${route.params.videoId}`}
    />
  );
}
