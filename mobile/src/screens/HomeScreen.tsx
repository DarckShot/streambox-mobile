import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export function HomeScreen(): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="StreamBox"
      title="Главная"
      description="Здесь появятся подборки, категории и продолжение просмотра."
    />
  );
}
