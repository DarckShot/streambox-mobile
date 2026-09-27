# StreamBox Backend

NestJS API с Prisma и SQLite. Отдельный сервер базы не нужен. Сервер хранит только нормализованные метаданные RUTUBE, не хранит видеофайлы, сырой JSON или временные HLS URL.

## Запуск

Требуется Node.js 22+. Из каталога `backend/`:

```sh
npm install
cp .env.example .env
npm run prisma:deploy
npm run seed:legacy
npm run start:dev
```

`seed:legacy` импортирует реальные данные RUTUBE для исторических ID; при сетевой ошибке отдельного видео остальные продолжают импортироваться. Повторный запуск обновляет существующие записи. Для разработки миграций используйте `npm run prisma:migrate -- --name <name>`, затем коммитьте папку `prisma/migrations`. Для применения готовых миграций — `npm run prisma:deploy`. SQLite находится в `prisma/dev.db` при стандартном `DATABASE_URL`; `.env` и `*.db` игнорируются Git.

`.env`:

| Переменная | Значение |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite URL, например `file:./dev.db` |
| `PORT` | HTTP-порт, по умолчанию `3000` |
| `RUTUBE_TIMEOUT_MS` | Таймаут RUTUBE, по умолчанию `8000` |

## API

| Метод | Путь | Назначение |
| --- | --- | --- |
| GET | `/videos` | Каталог из SQLite; `?search=python` ищет по названию без учёта регистра |
| GET | `/videos/:id` | Одно видео или 404 |
| POST | `/videos/import` | `{ "input": "<RUTUBE URL или ID>" }`, импорт или обновление |
| POST | `/videos/:id/sync` | Повторная синхронизация метаданных |
| GET | `/videos/:id/playback` | `{ "url": "<временный HLS URL>" }`, `no-store` |
| GET | `/videos/:id/thumbnail` | Проксирование обложки с CDN RUTUBE без сохранения файла |

Пример импорта:

```sh
curl -X POST http://localhost:3000/videos/import \
  -H 'Content-Type: application/json' \
  -d '{"input":"https://rutube.ru/video/f0ca53a0f70c1d02543a6939abf988cc/"}'
```

Проверки: `npm run build`, `npm test`. Архитектура описана в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
