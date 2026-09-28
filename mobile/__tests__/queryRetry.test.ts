import { ApiError } from '../src/api/client';
import { shouldRetry } from '../src/api/queryClient';

it('повторяет только временные ошибки и ограничивает число попыток', () => {
  expect(shouldRetry(0, new ApiError('network', 'Нет сети.'))).toBe(true);
  expect(shouldRetry(1, new ApiError('timeout', 'Таймаут.'))).toBe(true);
  expect(shouldRetry(0, new ApiError('server', 'Недоступен.', 503))).toBe(true);
  expect(shouldRetry(2, new ApiError('network', 'Нет сети.'))).toBe(false);
  expect(shouldRetry(0, new ApiError('server', 'Ошибка.', 501))).toBe(false);
  for (const kind of ['invalid-request', 'unauthorized', 'forbidden', 'not-found'] as const)
    expect(shouldRetry(0, new ApiError(kind, 'Ошибка.'))).toBe(false);
});
