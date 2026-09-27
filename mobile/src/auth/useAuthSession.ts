import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AuthContextValue, AuthStatus } from './auth.types';
import {
  authenticate,
  clearSession,
  hasStoredSession,
  refreshSession,
  revokeSession,
  setSessionExpiredHandler,
} from './session';
import { useLegacyMigration } from './useLegacyMigration';

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
        if (!(await hasStoredSession())) {
          if (active) setStatus('unauthenticated');
          return;
        }
        await refreshSession();
        await migrateSession();
        if (active) setStatus('authenticated');
      } catch {
        if (!active) return;
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
  }, [restoreVersion, migrateSession]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void clearPrivateCache().finally(() => setStatus('unauthenticated'));
    });
    return () => setSessionExpiredHandler(null);
  }, [clearPrivateCache]);

  const signIn = useCallback(
    async (mode: 'login' | 'register', email: string, password: string): Promise<void> => {
      await clearPrivateCache();
      await authenticate(mode, email, password);
      await migrateSession();
      setStatus('authenticated');
    },
    [clearPrivateCache, migrateSession],
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
