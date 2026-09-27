import { migrateLegacyData } from '../src/auth/migrateLegacyData';

const mockLegacy = {
  favorites: [] as string[],
  history: [] as Array<{
    videoId: string;
    lastWatchedAt: number;
    position: number;
    duration: number;
  }>,
  positions: {} as Record<string, number>,
};
const mockRemoteFavorites = new Set<string>();
const mockRemoteHistory = new Set<string>();
const mockRemoteProgress = new Map<string, number>();
let mockFailVideoId: string | null = null;

jest.mock('../src/auth/session', () => ({ getSessionGeneration: () => 1 }));
jest.mock('../src/storage/favorites', () => ({
  loadFavoriteIds: jest.fn(async () => [...mockLegacy.favorites]),
  saveFavoriteIds: jest.fn(async (ids: string[]) => {
    mockLegacy.favorites = [...ids];
  }),
}));
jest.mock('../src/storage/watchHistory', () => ({
  loadWatchHistory: jest.fn(async () => [...mockLegacy.history]),
  saveWatchHistory: jest.fn(async (entries: typeof mockLegacy.history) => {
    mockLegacy.history = [...entries];
  }),
}));
jest.mock('../src/storage/videoProgress', () => ({
  loadAllVideoProgress: jest.fn(async () => ({ ...mockLegacy.positions })),
  clearVideoProgress: jest.fn(async (id: string) => {
    delete mockLegacy.positions[id];
  }),
}));
jest.mock('../src/api/me', () => ({
  getProgress: jest.fn(async () => []),
  addFavorite: jest.fn(async (id: string) => {
    const { ApiError } = require('../src/api/client');
    if (id === 'missing') throw new ApiError('not-found', 'Видео не найдено.', 404);
    if (id === mockFailVideoId) throw new ApiError('network', 'Сеть недоступна.');
    mockRemoteFavorites.add(id);
  }),
  recordWatch: jest.fn(async (id: string) => {
    mockRemoteHistory.add(id);
  }),
  saveProgress: jest.fn(async (id: string, position: number) => {
    mockRemoteProgress.set(id, position);
  }),
}));

beforeEach(() => {
  mockLegacy.favorites = [];
  mockLegacy.history = [];
  mockLegacy.positions = {};
  mockRemoteFavorites.clear();
  mockRemoteHistory.clear();
  mockRemoteProgress.clear();
  mockFailVideoId = null;
});

it('не возвращает историю и прогресс после их очистки на сервере', async () => {
  mockLegacy.history = [
    { videoId: 'video-001', lastWatchedAt: Date.now(), position: 20, duration: 100 },
  ];
  mockLegacy.positions = { 'video-001': 20 };
  await migrateLegacyData();
  expect(mockLegacy.history).toEqual([]);
  expect(mockLegacy.positions).toEqual({});

  mockRemoteHistory.clear();
  mockRemoteProgress.clear();
  await migrateLegacyData();
  expect(mockRemoteHistory.size).toBe(0);
  expect(mockRemoteProgress.size).toBe(0);
});

it('не восстанавливает удалённое избранное при повторном запуске миграции', async () => {
  mockLegacy.favorites = ['video-001', 'missing'];
  await migrateLegacyData();
  expect(mockLegacy.favorites).toEqual([]);
  expect([...mockRemoteFavorites]).toEqual(['video-001']);

  mockRemoteFavorites.delete('video-001');
  await migrateLegacyData();
  expect([...mockRemoteFavorites]).toEqual([]);
});

it('оставляет после сетевой ошибки только ещё не перенесённые записи', async () => {
  mockLegacy.favorites = ['video-001', 'video-002'];
  mockFailVideoId = 'video-002';
  await expect(migrateLegacyData()).rejects.toMatchObject({ kind: 'network' });
  expect(mockLegacy.favorites).toEqual(['video-002']);

  mockRemoteFavorites.delete('video-001');
  mockFailVideoId = null;
  await migrateLegacyData();
  expect([...mockRemoteFavorites]).toEqual(['video-002']);
  expect(mockLegacy.favorites).toEqual([]);
});
