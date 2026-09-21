import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export function ProfileScreen(): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="Личное пространство"
      title="Профиль"
      description="История просмотра и настройки собраны внутри профиля."
    />
  );
}
