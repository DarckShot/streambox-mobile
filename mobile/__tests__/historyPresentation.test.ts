import { sampleVideo } from '../testFixtures/video';
import {
  buildHistoryItems,
  formatHistoryDate,
  historyProgressLabel,
  historyProgressRatio,
} from '../src/utils/history';

it('показывает начатый просмотр даже без сохранённого прогресса', () => {
  const items = buildHistoryItems(
    [{ videoId: sampleVideo.id, lastWatchedAt: '2026-09-28T01:00:00.000Z', completed: false }],
    [],
    new Map([[sampleVideo.id, sampleVideo]]),
  );

  expect(items).toHaveLength(1);
  expect(historyProgressLabel(items[0])).toBe('Просмотр начат');
  expect(historyProgressRatio(items[0])).toBe(0);
});

it('сохраняет завершённый просмотр без активной позиции', () => {
  const items = buildHistoryItems(
    [{ videoId: sampleVideo.id, lastWatchedAt: '2026-09-28T01:00:00.000Z', completed: true }],
    [],
    new Map([[sampleVideo.id, sampleVideo]]),
  );

  expect(historyProgressLabel(items[0])).toBe('Просмотрено до конца');
  expect(historyProgressRatio(items[0])).toBe(1);
  expect(formatHistoryDate('invalid')).toBe('Дата неизвестна');
});
