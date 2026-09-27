import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'dotenv';

const SECRET_KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

export const setupLocalEnv = (
  directory: string,
  environment: NodeJS.ProcessEnv = process.env,
): boolean => {
  const envPath = join(directory, '.env');
  const templatePath = join(directory, '.env.example');
  const exists = existsSync(envPath);
  let contents = readFileSync(exists ? envPath : templatePath, 'utf8');
  const configured = parse(contents);

  const secrets = SECRET_KEYS.map((key) => {
    const inherited = environment[key];
    if (inherited === '') {
      throw new Error(`Переменная окружения ${key} задана пустой строкой.`);
    }
    const value = inherited !== undefined ? inherited : configured[key];
    if (value && value.length < 32) {
      throw new Error(`${key} должен содержать не менее 32 символов.`);
    }
    if (!value && environment.NODE_ENV === 'production') {
      throw new Error(`Для production необходимо задать ${key}.`);
    }
    return value || randomBytes(48).toString('hex');
  });

  if (secrets[0] === secrets[1]) {
    throw new Error('JWT_ACCESS_SECRET и JWT_REFRESH_SECRET должны отличаться.');
  }

  let changed = !exists;
  SECRET_KEYS.forEach((key, index) => {
    if (environment[key] !== undefined || configured[key]) return;
    const line = `${key}=${secrets[index]}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    contents = pattern.test(contents)
      ? contents.replace(pattern, line)
      : `${contents.trimEnd()}\n${line}\n`;
    changed = true;
  });

  if (changed) {
    writeFileSync(envPath, `${contents.trimEnd()}\n`, { mode: 0o600 });
    chmodSync(envPath, 0o600);
  }
  return changed;
};

if (require.main === module && setupLocalEnv(process.cwd())) {
  process.stdout.write('Локальный backend/.env настроен.\n');
}
