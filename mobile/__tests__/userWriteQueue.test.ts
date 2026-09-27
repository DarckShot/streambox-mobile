import { drainUserWrites, enqueueUserWrite } from '../src/services/userWriteQueue';

it('ждёт отложенное сохранение перед очисткой данных пользователя', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const completed: string[] = [];
  enqueueUserWrite('user-1:video-1:history', async () => {
    await pending;
    completed.push('saved');
  });

  const draining = drainUserWrites('user-1').then(() => completed.push('drained'));
  await Promise.resolve();
  expect(completed).toEqual([]);

  release();
  await draining;
  expect(completed).toEqual(['saved', 'drained']);
});
