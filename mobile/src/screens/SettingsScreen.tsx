import type { ReactElement } from 'react';

import { PlaceholderScreen } from '../components/placeholder/PlaceholderScreen';

export function SettingsScreen(): ReactElement {
  return (
    <PlaceholderScreen
      eyebrow="StreamBox"
      title="Настройки"
      description="Настройки приложения и воспроизведения будут добавлены здесь."
    />
  );
}
