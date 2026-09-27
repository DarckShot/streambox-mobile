import { useEffect } from 'react';
import { Linking } from 'react-native';

import type { AuthStatus } from '../auth/auth.types';
import { takePendingPrivatePath } from './linking';

export const usePendingPrivateLink = (status: AuthStatus): void => {
  useEffect(() => {
    if (status !== 'authenticated') return;
    const path = takePendingPrivatePath();
    if (!path) return;
    const timer = setTimeout(() => {
      Linking.openURL(`streambox://${path}`).catch(() => undefined);
    }, 100);
    return () => clearTimeout(timer);
  }, [status]);
};
