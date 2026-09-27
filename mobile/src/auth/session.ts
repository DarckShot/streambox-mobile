import axios from 'axios';
import * as Keychain from 'react-native-keychain';

import { API_BASE_URL } from '../config/apiConfig';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const SERVICE = 'streambox.refresh-token';
const authClient = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let generation = 0;
let onExpired: (() => void) | null = null;
let keychainQueue: Promise<unknown> = Promise.resolve();

const enqueueKeychain = <T>(operation: () => Promise<T>): Promise<T> => {
  const next = keychainQueue.catch(() => undefined).then(operation);
  keychainQueue = next.catch(() => undefined);
  return next;
};

const isTokenPair = (value: unknown): value is TokenPair =>
  typeof value === 'object' &&
  value !== null &&
  'accessToken' in value &&
  typeof value.accessToken === 'string' &&
  value.accessToken.length > 0 &&
  'refreshToken' in value &&
  typeof value.refreshToken === 'string' &&
  value.refreshToken.length > 0;

export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  onExpired = handler;
};

export const getAccessToken = (): string | null => accessToken;
export const getSessionGeneration = (): number => generation;

export const clearSession = async (): Promise<void> => {
  generation += 1;
  accessToken = null;
  await enqueueKeychain(() => Keychain.resetGenericPassword({ service: SERVICE }));
};

export const saveSession = async (
  tokens: TokenPair,
  expectedGeneration = generation,
): Promise<void> => {
  if (!isTokenPair(tokens)) throw new Error('Сервер вернул некорректную сессию.');
  await enqueueKeychain(async () => {
    if (expectedGeneration !== generation) throw new Error('Сессия завершена.');
    await Keychain.setGenericPassword('refresh', tokens.refreshToken, { service: SERVICE });
  });
  if (expectedGeneration !== generation) throw new Error('Сессия завершена.');
  accessToken = tokens.accessToken;
};

export const refreshSession = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  const startedAt = generation;
  refreshPromise = (async () => {
    const stored = await enqueueKeychain(() => Keychain.getGenericPassword({ service: SERVICE }));
    if (!stored) throw new Error('Нет сохранённой сессии.');
    let data: unknown;
    try {
      const response = await authClient.post<unknown>('/auth/refresh', {
        refreshToken: stored.password,
      });
      data = response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401 && startedAt === generation) {
        await clearSession();
        onExpired?.();
      }
      throw error;
    }
    if (!isTokenPair(data)) throw new Error('Сервер вернул некорректную сессию.');
    if (startedAt !== generation) throw new Error('Сессия завершена.');
    await saveSession(data, startedAt);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

export const hasStoredSession = async (): Promise<boolean> =>
  Boolean(await enqueueKeychain(() => Keychain.getGenericPassword({ service: SERVICE })));

export const authenticate = async (
  mode: 'login' | 'register',
  email: string,
  password: string,
): Promise<void> => {
  const { data } = await authClient.post<unknown>(`/auth/${mode}`, { email, password });
  if (!isTokenPair(data)) throw new Error('Сервер вернул некорректную сессию.');
  generation += 1;
  await saveSession(data, generation);
};

export const revokeSession = async (): Promise<void> => {
  const token = accessToken;
  try {
    if (token)
      await authClient.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
  } finally {
    await clearSession();
  }
};
