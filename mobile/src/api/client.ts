import axios from 'axios';

import { API_BASE_URL } from '../config/apiConfig';
import { getAccessToken, refreshSession } from '../auth/session';
import type { InternalAxiosRequestConfig } from 'axios';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'not-found'
  | 'server'
  | 'invalid-request'
  | 'invalid-response'
  | 'unauthorized'
  | 'forbidden'
  | 'cancelled'
  | 'rutube-unavailable'
  | 'playback-unavailable';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;
  const config = error.config as InternalAxiosRequestConfig & { retriedAfterRefresh?: boolean };
  if (config.retriedAfterRefresh) throw error;
  config.retriedAfterRefresh = true;
  const token = await refreshSession();
  config.headers.Authorization = `Bearer ${token}`;
  return apiClient(config);
});

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') return new ApiError('cancelled', 'Запрос отменён.');
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('timeout', 'Сервер не ответил вовремя. Попробуйте ещё раз.');
    }
    const status = error.response?.status;
    const responseData = error.response?.data;
    const responseCode =
      typeof responseData === 'object' && responseData !== null && 'code' in responseData
        ? responseData.code
        : null;
    if (responseCode === 'RUTUBE_UNAVAILABLE')
      return new ApiError('rutube-unavailable', 'RUTUBE временно недоступен.', status);
    if (responseCode === 'PLAYBACK_UNAVAILABLE')
      return new ApiError('playback-unavailable', 'Видео сейчас нельзя воспроизвести.', status);
    if (status === 401) return new ApiError('unauthorized', 'Требуется вход в аккаунт.', status);
    if (status === 403) return new ApiError('forbidden', 'Нет доступа к этим данным.', status);
    if (status === 404) return new ApiError('not-found', 'Видео не найдено.', status);
    if (status === 400 || status === 422) {
      const response = error.response?.data;
      const message =
        typeof response === 'object' && response !== null && 'message' in response
          ? response.message
          : null;
      return new ApiError(
        'invalid-request',
        typeof message === 'string' ? message : 'Проверьте введённые данные.',
        status,
      );
    }
    if (status && status >= 500)
      return new ApiError('server', 'Сервис временно недоступен.', status);
    if (status)
      return new ApiError('invalid-request', 'Запрос не выполнен. Попробуйте ещё раз.', status);
    return new ApiError('network', 'Не удалось связаться с сервером.', status);
  }
  return new ApiError('network', 'Не удалось загрузить данные.');
};
