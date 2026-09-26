import { normalizeSearchQuery, searchVideoCatalog } from '../src/utils/searchVideoCatalog';

it('ищет только по названию без учёта регистра и крайних пробелов', () => {
  const query = normalizeSearchQuery('  КОСМОС  ');
  expect(searchVideoCatalog(query).map((video) => video.id)).toEqual(['video-001']);
  expect(searchVideoCatalog(normalizeSearchQuery('  природа  ')).map((video) => video.id)).toEqual([
    'video-002',
  ]);
  expect(searchVideoCatalog(normalizeSearchQuery('Документальное'))).toEqual([]);
});
