import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export const FavoritesScreen = (): ReactElement => (
  <PlaceholderScreen
    eyebrow="Ваша коллекция"
    title="Избранное"
    description="Сохранённые видео будут доступны в одном месте."
  />
);
