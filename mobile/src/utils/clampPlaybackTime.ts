export const clampPlaybackTime = (time: number, duration: number): number => {
  const nonnegativeTime = Math.max(time, 0);
  return duration > 0 ? Math.min(nonnegativeTime, duration) : nonnegativeTime;
};
