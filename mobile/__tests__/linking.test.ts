import { LINKING_CONFIG, LINKING_OPTIONS } from '../src/navigation/linking';
import { RootRoute, TabRoute } from '../src/navigation/routes';

jest.mock('../src/auth/session', () => ({ hasActiveSession: () => true }));

const parse = (path: string) => LINKING_OPTIONS.getStateFromPath!(path, LINKING_CONFIG);

it.each([
  ['', TabRoute.Home],
  ['home', TabRoute.Home],
  ['search', TabRoute.Search],
  ['favorites', TabRoute.Favorites],
  ['profile', TabRoute.Profile],
])('открывает %s на нужной вкладке', (path, tab) => {
  const state = parse(path);
  expect(state?.routes[state.index ?? 0].name).toBe(RootRoute.Main);
  const main = state?.routes[state.index ?? 0].state;
  expect(main?.routes[main.index ?? 0].name).toBe(tab);
});

it.each([
  ['profile/history', RootRoute.History],
  ['history', RootRoute.History],
  ['settings', RootRoute.Settings],
  ['profile/settings', RootRoute.Settings],
  ['videos/video-001', RootRoute.VideoDetails],
  ['player/video-001', RootRoute.Player],
])('создаёт стек для %s с возвратом на Home', (path, route) => {
  const state = parse(path);
  expect(state?.routes.map((item) => item.name)).toEqual([RootRoute.Main, route]);
  if (path.includes('video-001')) {
    expect(state?.routes[1].params).toEqual({ videoId: 'video-001' });
  }
});

it('не падает на неизвестном и повреждённом videoId', () => {
  expect(parse('videos/unknown')?.routes[1].params).toEqual({ videoId: 'unknown' });
  expect(() => parse('videos/%')).not.toThrow();
  expect(parse('player/')?.routes[0].name).toBe(RootRoute.Main);
});
