import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

let online = true;
let eventRevision = 0;
const listeners = new Set<() => void>();

const update = (connected: boolean | null, reachable: boolean | null): void => {
  const next = connected !== false && reachable !== false;
  if (next === online) return;
  online = next;
  onlineManager.setOnline(next);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isOnline = (): boolean => online;
export const subscribeNetwork = subscribe;
export const useOnline = (): boolean => useSyncExternalStore(subscribe, isOnline, () => true);
export const refreshNetworkState = async (): Promise<void> => {
  try {
    const revision = eventRevision;
    const state = await NetInfo.refresh();
    if (revision === eventRevision) update(state.isConnected, state.isInternetReachable);
  } catch {
    // При ошибке проверки сохраняем последнее достоверное состояние сети.
  }
};
export const startNetworkTracking = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    eventRevision += 1;
    update(state.isConnected, state.isInternetReachable);
  });
  const interval = setInterval(() => {
    if (!online) refreshNetworkState();
  }, 10_000);
  return () => {
    unsubscribe();
    clearInterval(interval);
  };
};
