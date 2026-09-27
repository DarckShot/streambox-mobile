const pendingWrites = new Map<string, Promise<unknown>>();

export const enqueueUserWrite = (key: string, operation: () => Promise<unknown>): void => {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(operation);
  pendingWrites.set(key, next);
  next
    .finally(() => {
      if (pendingWrites.get(key) === next) pendingWrites.delete(key);
    })
    .catch(() => undefined);
};

export const drainUserWrites = async (userId: string): Promise<void> => {
  const active = [...pendingWrites.entries()]
    .filter(([key]) => key.startsWith(`${userId}:`))
    .map(([, promise]) => promise);
  await Promise.allSettled(active);
};
