import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export function HistoryScreen(): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="Продолжите просмотр"
      title="История"
      description="Прогресс и недавно открытые видео будут отображаться здесь."
    />
  );
}
