import axios from 'axios';

import { API_BASE_URL } from '../config/apiConfig';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'not-found'
  | 'server'
  | 'invalid-request'
  | 'invalid-response';

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

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('timeout', 'Сервер не ответил вовремя. Попробуйте ещё раз.');
    }
    const status = error.response?.status;
    if (status === 404) return new ApiError('not-found', 'Видео не найдено.', status);
    if (status === 400) {
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
    return new ApiError('network', 'Не удалось связаться с сервером.', status);
  }
  return new ApiError('network', 'Не удалось загрузить данные.');
};
