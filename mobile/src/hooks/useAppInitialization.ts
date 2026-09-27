import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { usePlaybackSettingsStore } from '../store/usePlaybackSettingsStore';

export const useAppInitialization = (): void => {
  useEffect(() => {
    void usePlaybackSettingsStore.getState().loadSettings();
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);
};
