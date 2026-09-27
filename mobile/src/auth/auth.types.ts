export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated' | 'restore-error';
export type MigrationStatus = 'idle' | 'running' | 'error' | 'complete';

export interface AuthContextValue {
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retryRestore: () => void;
  migrationStatus: MigrationStatus;
  retryMigration: () => void;
}
