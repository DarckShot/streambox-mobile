import { VIDEO_CATALOG } from '../constants/videoCatalog';
import type { Video } from '../types/video';

export const normalizeSearchQuery = (query: string): string => query.trim().toLocaleLowerCase();

export const searchVideoCatalog = (normalizedQuery: string): Video[] =>
  VIDEO_CATALOG.filter((video) => video.title.toLocaleLowerCase().includes(normalizedQuery));
