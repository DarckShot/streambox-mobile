import { loadWatchHistory } from '../src/storage/watchHistory';
import { useWatchHistoryStore } from '../src/store/useWatchHistoryStore';

const mockItems = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  createAsyncStorage: () => ({
    getItem: (key: string) => Promise.resolve(mockItems.get(key) ?? null),
    setItem: (key: string, value: string) => {
      mockItems.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      mockItems.delete(key);
      return Promise.resolve();
    },
  }),
}));

beforeEach(() => {
  mockItems.clear();
  useWatchHistoryStore.setState({ entries: [], error: null, loaded: false });
});

it('сохраняет одну запись на видео, сортирует по времени и очищает историю', async () => {
  await useWatchHistoryStore.getState().loadHistory();
  const now = jest.spyOn(Date, 'now');
  now.mockReturnValueOnce(1000).mockReturnValueOnce(2000).mockReturnValueOnce(3000);

  useWatchHistoryStore.getState().recordWatch('video-001', 12, 90);
  useWatchHistoryStore.getState().recordWatch('video-002', 8, 60);
  useWatchHistoryStore.getState().recordWatch('video-001', 35, 90);

  expect(useWatchHistoryStore.getState().entries.map((entry) => entry.videoId)).toEqual([
    'video-001',
    'video-002',
  ]);
  expect(useWatchHistoryStore.getState().entries[0].position).toBe(35);
  expect((await loadWatchHistory())[0].position).toBe(35);

  useWatchHistoryStore.setState({ entries: [], loaded: false });
  await useWatchHistoryStore.getState().loadHistory();
  expect(useWatchHistoryStore.getState().entries).toHaveLength(2);

  useWatchHistoryStore.getState().clearHistory();
  expect(await loadWatchHistory()).toEqual([]);
  now.mockRestore();
});
