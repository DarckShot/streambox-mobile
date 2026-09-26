import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import {
  clearVideoProgress,
  loadVideoProgress,
  saveVideoProgress,
} from '../src/storage/videoProgress';

const storage = createAsyncStorage('streamboxPlaybackProgress');

beforeEach(async () => {
  await storage.clear();
});

describe('videoProgress', () => {
  it('хранит позиции разных видео отдельно и удаляет только завершённое', async () => {
    await Promise.all([saveVideoProgress('first', 42.5), saveVideoProgress('second', 15)]);

    expect(await loadVideoProgress('first')).toBe(42.5);
    expect(await loadVideoProgress('second')).toBe(15);

    await clearVideoProgress('first');

    expect(await loadVideoProgress('first')).toBeNull();
    expect(await loadVideoProgress('second')).toBe(15);
  });

  it('игнорирует повреждённую и отсутствующую позицию', async () => {
    expect(await loadVideoProgress('missing')).toBeNull();

    for (const value of ['oops', 'Infinity', '-3', '0']) {
      await storage.setItem('video:invalid', value);
      expect(await loadVideoProgress('invalid')).toBeNull();
    }
  });

  it('не возвращает старую позицию после сброса с ожидающими записями', async () => {
    const firstWrite = saveVideoProgress('first', 10);
    const secondWrite = saveVideoProgress('first', 20);
    const clear = clearVideoProgress('first');

    await Promise.all([firstWrite, secondWrite, clear]);

    expect(await loadVideoProgress('first')).toBeNull();
  });
});
