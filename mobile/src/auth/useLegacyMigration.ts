import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { MigrationStatus } from './auth.types';
import { migrateLegacyData } from './migrateLegacyData';

interface LegacyMigration {
  migrationStatus: MigrationStatus;
  migrateSession: () => Promise<void>;
  retryMigration: () => void;
}

export const useLegacyMigration = (): LegacyMigration => {
  const queryClient = useQueryClient();
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');

  const migrateSession = useCallback(async (): Promise<void> => {
    setMigrationStatus('running');
    try {
      await migrateLegacyData();
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setMigrationStatus('complete');
    } catch {
      setMigrationStatus('error');
    }
  }, [queryClient]);

  const retryMigration = useCallback((): void => {
    void migrateSession();
  }, [migrateSession]);

  return { migrationStatus, migrateSession, retryMigration };
};
