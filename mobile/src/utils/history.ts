import type { HistoryRecord, ProgressRecord } from '../api/me';
import type { HistoryItem } from '../types/history';
import type { Video } from '../types/video';
import { formatPlaybackTime } from './formatPlaybackTime';

export const buildHistoryItems = (
  records: HistoryRecord[],
  progress: ProgressRecord[],
  videosById: Map<string, Video>,
): HistoryItem[] => {
  const progressById = new Map(progress.map((entry) => [entry.videoId, entry]));
  return records.flatMap((record) => {
    const video = videosById.get(record.videoId);
    if (!video) return [];
    const saved = progressById.get(record.videoId);
    return [
      {
        video,
        lastWatchedAt: record.lastWatchedAt,
        position: saved?.positionSeconds ?? 0,
        duration: saved?.durationSeconds ?? 0,
        completed: record.completed,
      },
    ];
  });
};

export const historyProgressRatio = (item: HistoryItem): number => {
  if (item.completed) return 1;
  if (!Number.isFinite(item.position) || !Number.isFinite(item.duration) || item.duration <= 0)
    return 0;
  return Math.max(0, Math.min(item.position / item.duration, 1));
};

export const historyProgressLabel = (item: HistoryItem): string => {
  if (item.completed) return 'Просмотрено до конца';
  if (!Number.isFinite(item.position) || item.position <= 0) return 'Просмотр начат';
  return `${formatPlaybackTime(item.position)} / ${formatPlaybackTime(item.duration)}`;
};

export const formatHistoryDate = (value: string): string => {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return 'Дата неизвестна';
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};
