import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import type { AuthContextValue, AuthStatus } from './auth.types';
import {
  authenticate,
  clearSession,
  getAccessToken,
  setOfflineIdentityActive,
  hasStoredSession,
  refreshSession,
  revokeSession,
  setSessionExpiredHandler,
} from './session';
import { useLegacyMigration } from './useLegacyMigration';
import { getCurrentUser } from '../api/me';
import { restorePublicCache, restoreUserCache } from '../services/queryPersistence';
import { clearCachedIdentity, readCachedIdentity, writeCachedIdentity } from './cachedIdentity';
import { toApiError } from '../api/client';
import { applyPendingActions, loadOfflineQueue, syncOfflineQueue } from '../services/offlineQueue';
import { subscribeNetwork, isOnline } from '../services/networkState';

export const useAuthSession = (): AuthContextValue => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [restoreVersion, setRestoreVersion] = useState(0);
  const { migrationStatus, migrateSession, retryMigration } = useLegacyMigration();

  const clearPrivateCache = useCallback(async (): Promise<void> => {
    await queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    const restore = async (): Promise<void> => {
      try {
        await restorePublicCache(queryClient);
        if (!(await hasStoredSession())) {
          if (active) setStatus('unauthenticated');
          return;
        }
        await refreshSession();
        const user = await getCurrentUser();
        await writeCachedIdentity(user);
        await restoreUserCache(queryClient, user.id);
        queryClient.setQueryData(['session', 'me'], user);
        await loadOfflineQueue(user.id);
        applyPendingActions(user.id);
        void syncOfflineQueue(user.id);
        await migrateSession();
        if (active) setStatus('authenticated');
      } catch (error) {
        if (!active) return;
        const kind = toApiError(error).kind;
        if (kind === 'network' || kind === 'timeout' || kind === 'server') {
          const cachedUser = await readCachedIdentity();
          if (cachedUser && (await hasStoredSession())) {
            await restoreUserCache(queryClient, cachedUser.id);
            queryClient.setQueryData(['session', 'me'], cachedUser);
            setOfflineIdentityActive(true);
            await loadOfflineQueue(cachedUser.id);
            applyPendingActions(cachedUser.id);
            setStatus('authenticated');
            return;
          }
        }
        try {
          setStatus((await hasStoredSession()) ? 'restore-error' : 'unauthenticated');
        } catch {
          setStatus('restore-error');
        }
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, [restoreVersion, migrateSession, queryClient]);

  useEffect(() => {
    const synchronize = (): void => {
      if (!isOnline() || status !== 'authenticated') return;
      const userId = queryClient.getQueryData<{ id: string }>(['session', 'me'])?.id;
      if (!userId) return;
      void (async () => {
        try {
          if (!getAccessToken()) await refreshSession();
          await syncOfflineQueue(userId);
        } catch {
          console.warn('Не удалось восстановить сессию после подключения.');
        }
      })();
    };
    const unsubscribe = subscribeNetwork(synchronize);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') synchronize();
    });
    return () => {
      unsubscribe();
      appState.remove();
    };
  }, [queryClient, status]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void clearPrivateCache().finally(async () => {
        await clearCachedIdentity();
        setStatus('unauthenticated');
      });
    });
    return () => setSessionExpiredHandler(null);
  }, [clearPrivateCache]);

  const signIn = useCallback(
    async (mode: 'login' | 'register', email: string, password: string): Promise<void> => {
      await clearPrivateCache();
      await authenticate(mode, email, password);
      const user = await getCurrentUser();
      await writeCachedIdentity(user);
      await restoreUserCache(queryClient, user.id);
      queryClient.setQueryData(['session', 'me'], user);
      await loadOfflineQueue(user.id);
      applyPendingActions(user.id);
      void syncOfflineQueue(user.id);
      await migrateSession();
      setStatus('authenticated');
    },
    [clearPrivateCache, migrateSession, queryClient],
  );
  const login = useCallback(
    (email: string, password: string): Promise<void> => signIn('login', email, password),
    [signIn],
  );
  const register = useCallback(
    (email: string, password: string): Promise<void> => signIn('register', email, password),
    [signIn],
  );
  const logout = useCallback(async (): Promise<void> => {
    try {
      await revokeSession();
    } catch {
      await clearSession();
    } finally {
      await clearPrivateCache();
      await clearCachedIdentity();
      setOfflineIdentityActive(false);
      setStatus('unauthenticated');
    }
  }, [clearPrivateCache]);
  const retryRestore = useCallback((): void => {
    setStatus('restoring');
    setRestoreVersion((version) => version + 1);
  }, []);

  return useMemo(
    () => ({ status, login, register, logout, retryRestore, migrationStatus, retryMigration }),
    [status, login, register, logout, retryRestore, migrationStatus, retryMigration],
  );
};
