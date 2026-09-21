import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export function FavoritesScreen(): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="Ваша коллекция"
      title="Избранное"
      description="Сохранённые видео будут доступны в одном месте."
    />
  );
}
