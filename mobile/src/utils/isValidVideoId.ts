export const isValidVideoId = (id: unknown): id is string =>
  typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
