import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { usePlaybackSettingsStore } from '../store/usePlaybackSettingsStore';
import { queryClient } from '../api/queryClient';
import { refreshNetworkState, startNetworkTracking } from '../services/networkState';
import { startQueryPersistence } from '../services/queryPersistence';

export const useAppInitialization = (): void => {
  useEffect(() => {
    void usePlaybackSettingsStore.getState().loadSettings();
    const stopNetworkTracking = startNetworkTracking();
    const stopPersistence = startQueryPersistence(queryClient);
    void refreshNetworkState();
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
      if (state === 'active') void refreshNetworkState();
    });
    return () => {
      subscription.remove();
      stopNetworkTracking();
      stopPersistence();
    };
  }, []);
};
