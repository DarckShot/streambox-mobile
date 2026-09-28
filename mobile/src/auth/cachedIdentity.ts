import * as Keychain from 'react-native-keychain';

import type { CurrentUser } from '../api/me';

const SERVICE = 'streambox.cached-identity';

export const readCachedIdentity = async (): Promise<CurrentUser | null> => {
  try {
    const record = await Keychain.getGenericPassword({ service: SERVICE });
    if (!record) return null;
    const value: unknown = JSON.parse(record.password);
    return typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'string' &&
      'email' in value &&
      typeof value.email === 'string'
      ? (value as CurrentUser)
      : null;
  } catch {
    return null;
  }
};

export const writeCachedIdentity = async (user: CurrentUser): Promise<void> => {
  await Keychain.setGenericPassword('user', JSON.stringify(user), { service: SERVICE });
};

export const clearCachedIdentity = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: SERVICE });
};
