import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'dotenv';

import { setupLocalEnv } from './setup-env';

const directories: string[] = [];
const createDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'streambox-env-'));
  directories.push(directory);
  writeFileSync(
    join(directory, '.env.example'),
    'DATABASE_URL="file:./dev.db"\nJWT_ACCESS_SECRET=\nJWT_REFRESH_SECRET=\n',
  );
  return directory;
};

afterAll(() =>
  directories.forEach((directory) => rmSync(directory, { recursive: true, force: true })),
);

describe('setupLocalEnv', () => {
  it('заполняет пустой шаблон и не меняет секреты при повторном запуске', () => {
    const directory = createDirectory();
    writeFileSync(join(directory, '.env'), readFileSync(join(directory, '.env.example')));

    expect(setupLocalEnv(directory, {})).toBe(true);
    const first = readFileSync(join(directory, '.env'), 'utf8');
    const secrets = parse(first);
    expect(secrets.JWT_ACCESS_SECRET).toHaveLength(96);
    expect(secrets.JWT_REFRESH_SECRET).toHaveLength(96);
    expect(secrets.JWT_ACCESS_SECRET).not.toBe(secrets.JWT_REFRESH_SECRET);
    expect(setupLocalEnv(directory, {})).toBe(false);
    expect(readFileSync(join(directory, '.env'), 'utf8')).toBe(first);
  });

  it('не заменяет заданный секрет при генерации отсутствующего', () => {
    const directory = createDirectory();
    const existing = 'a'.repeat(64);
    writeFileSync(join(directory, '.env'), `JWT_ACCESS_SECRET=${existing}\nJWT_REFRESH_SECRET=\n`);

    setupLocalEnv(directory, {});

    const secrets = parse(readFileSync(join(directory, '.env')));
    expect(secrets.JWT_ACCESS_SECRET).toBe(existing);
    expect(secrets.JWT_REFRESH_SECRET).toHaveLength(96);
  });

  it('не создаёт случайные секреты для production', () => {
    const directory = createDirectory();
    expect(() => setupLocalEnv(directory, { NODE_ENV: 'production' })).toThrow();
    expect(() => readFileSync(join(directory, '.env'))).toThrow();
  });
});
