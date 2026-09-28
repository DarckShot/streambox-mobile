import NetInfo from '@react-native-community/netinfo';

import { isOnline, refreshNetworkState, startNetworkTracking } from '../src/services/networkState';

const connected = { isConnected: true, isInternetReachable: true };
const disconnected = { isConnected: false, isInternetReachable: false };

it('убирает offline-состояние после восстановления подключения', () => {
  let notify: ((state: typeof connected) => void) | undefined;
  jest.spyOn(NetInfo, 'addEventListener').mockImplementation((listener) => {
    notify = listener as (state: typeof connected) => void;
    return jest.fn();
  });

  const stop = startNetworkTracking();
  notify?.(disconnected);
  expect(isOnline()).toBe(false);
  notify?.(connected);
  expect(isOnline()).toBe(true);
  stop();
  jest.restoreAllMocks();
});

it('не перезаписывает свежий online-сигнал устаревшим ответом refresh', async () => {
  let notify: ((state: typeof connected) => void) | undefined;
  jest.spyOn(NetInfo, 'addEventListener').mockImplementation((listener) => {
    notify = listener as (state: typeof connected) => void;
    return jest.fn();
  });
  let resolveRefresh!: (state: typeof disconnected) => void;
  jest.spyOn(NetInfo, 'refresh').mockReturnValue(
    new Promise((resolve) => {
      resolveRefresh = resolve as (state: typeof disconnected) => void;
    }),
  );

  const stop = startNetworkTracking();
  const refresh = refreshNetworkState();
  notify?.(connected);
  resolveRefresh(disconnected);
  await refresh;
  expect(isOnline()).toBe(true);
  stop();
  jest.restoreAllMocks();
});

it('ручная проверка обновляет состояние сети после восстановления', async () => {
  let notify: ((state: typeof connected) => void) | undefined;
  jest.spyOn(NetInfo, 'addEventListener').mockImplementation((listener) => {
    notify = listener as (state: typeof connected) => void;
    return jest.fn();
  });
  jest
    .spyOn(NetInfo, 'refresh')
    .mockResolvedValue(connected as Awaited<ReturnType<typeof NetInfo.refresh>>);

  const stop = startNetworkTracking();
  notify?.(disconnected);
  expect(isOnline()).toBe(false);
  await refreshNetworkState();
  expect(isOnline()).toBe(true);
  stop();
  jest.restoreAllMocks();
});
