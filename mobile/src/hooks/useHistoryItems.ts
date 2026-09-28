import { useVideosByIds } from './useVideosByIds';
import { useUserCollections } from './useUserData';
import type { HistoryItem } from '../types/history';
import { buildHistoryItems } from '../utils/history';
import { useOnline } from '../services/networkState';

interface HistoryItemsResult {
  userId: string;
  items: HistoryItem[];
  recordCount: number;
  loading: boolean;
  videosLoading: boolean;
  error: string | null;
  videosError: Error | null;
  retry: () => void;
}

export const useHistoryItems = (): HistoryItemsResult => {
  const online = useOnline();
  const { userId, history, progress } = useUserCollections();
  const records = history.data ?? [];
  const videos = useVideosByIds(records.map((entry) => entry.videoId));
  const items = buildHistoryItems(records, progress.data ?? [], videos.byId);

  const retry = (): void => {
    if (history.isError) void history.refetch();
    if (progress.isError) void progress.refetch();
    videos.refetch();
  };

  return {
    userId,
    items,
    recordCount: records.length,
    loading: online && (history.isPending || progress.isPending),
    videosLoading: videos.isLoading,
    error:
      !online && history.isPending
        ? 'Нет подключения. История загрузится после восстановления сети.'
        : history.error?.message ?? progress.error?.message ?? null,
    videosError: videos.error,
    retry,
  };
};
