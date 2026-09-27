import type { Video } from './video';

export interface HistoryItem {
  video: Video;
  lastWatchedAt: string;
  position: number;
  duration: number;
  completed: boolean;
}
