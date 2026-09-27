export interface Video {
  id: string;
  externalId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
  durationSeconds: number;
  description: string;
  author: string | null;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}
