export const clampPlaybackTime = (time: number, duration: number): number =>
  Math.min(Math.max(time, 0), Math.max(duration, 0));
