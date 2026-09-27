import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { usePlaybackSettingsStore } from '../src/store/usePlaybackSettingsStore';
import { useSavedProgressStore } from '../src/store/useSavedProgressStore';
import { loadVideoProgress, saveVideoProgress } from '../src/storage/videoProgress';

it('сохраняет настройку автозапуска между загрузками', async () => {
  const storage = createAsyncStorage('streamboxPlaybackSettings');
  await storage.clear();
  usePlaybackSettingsStore.setState({ autoPlayOnResume: true, loaded: false });
  await usePlaybackSettingsStore.getState().loadSettings();
  expect(usePlaybackSettingsStore.getState().autoPlayOnResume).toBe(true);
  await usePlaybackSettingsStore.getState().setAutoPlayOnResume(false);
  usePlaybackSettingsStore.setState({ autoPlayOnResume: true, loaded: false });
  await usePlaybackSettingsStore.getState().loadSettings();
  expect(usePlaybackSettingsStore.getState().autoPlayOnResume).toBe(false);
});

it('загружает позиции каталога и очищает их по подтверждённому действию', async () => {
  const storage = createAsyncStorage('streamboxPlaybackProgress');
  await storage.clear();
  await saveVideoProgress('video-001', 12);
  await saveVideoProgress('video-002', 34);
  useSavedProgressStore.setState({ loaded: false, positions: {} });
  await useSavedProgressStore.getState().loadProgress();
  expect(Object.keys(useSavedProgressStore.getState().positions)).toHaveLength(2);
  await useSavedProgressStore.getState().clearProgress();
  expect(useSavedProgressStore.getState().positions).toEqual({});
  expect(await loadVideoProgress('video-001')).toBeNull();
  expect(await loadVideoProgress('video-002')).toBeNull();
});
