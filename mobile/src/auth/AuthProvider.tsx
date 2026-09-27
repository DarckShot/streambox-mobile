import { createContext, useContext, type ReactElement, type ReactNode } from 'react';

import type { AuthContextValue } from './auth.types';
import { useAuthSession } from './useAuthSession';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const value = useAuthSession();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider не подключён.');
  return value;
};
