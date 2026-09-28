# StreamBox Backend

NestJS API с Prisma и SQLite. Отдельный сервер базы не нужен. Сервер хранит только нормализованные метаданные RUTUBE, не хранит видеофайлы, сырой JSON или временные HLS URL.

Каталог читается из SQLite даже при недоступном RUTUBE. Повторный импорт использует уже сохранённые метаданные, если `lastSyncedAt` моложе одного часа; явная синхронизация всегда запрашивает RUTUBE. Ошибки API имеют `statusCode`, `code` и безопасное сообщение; временная недоступность RUTUBE и playback различаются по `code`. Запросы к RUTUBE ограничены `RUTUBE_TIMEOUT_MS`.

## Запуск

Требуется Node.js 22+. Из каталога `backend/`:

```sh
npm install
npm run setup:env
npm run prisma:deploy
npm run seed:legacy
npm run start:dev
```

`setup:env` создаёт `.env` из шаблона и генерирует два разных JWT-секрета, если они ещё не заданы. При повторном запуске существующие секреты сохраняются; `start:dev` вызывает настройку автоматически. Не копируйте шаблон поверх существующего `.env`: это сбросит секреты и завершит ранее выданные сессии. В production задавайте секреты самостоятельно. `seed:legacy` импортирует реальные данные RUTUBE для исторических ID; при сетевой ошибке отдельного видео остальные продолжают импортироваться. Повторный запуск обновляет существующие записи. Для разработки миграций используйте `npm run prisma:migrate -- --name <name>`, затем коммитьте папку `prisma/migrations`. Для применения готовых миграций — `npm run prisma:deploy`. SQLite находится в `prisma/dev.db` при стандартном `DATABASE_URL`; `.env` и `*.db` игнорируются Git.

`.env`:

| Переменная           | Значение                                     |
| -------------------- | -------------------------------------------- |
| `DATABASE_URL`       | Prisma SQLite URL, например `file:./dev.db`  |
| `PORT`               | HTTP-порт, по умолчанию `3000`               |
| `RUTUBE_TIMEOUT_MS`  | Таймаут RUTUBE, по умолчанию `8000`          |
| `JWT_ACCESS_SECRET`  | Секрет access JWT, от 32 символов            |
| `JWT_REFRESH_SECRET` | Отдельный секрет refresh JWT, от 32 символов |

## API

| Метод | Путь                    | Назначение                                                              |
| ----- | ----------------------- | ----------------------------------------------------------------------- |
| GET   | `/videos`               | Каталог из SQLite; `?search=python` ищет по названию без учёта регистра |
| GET   | `/videos/:id`           | Одно видео или 404                                                      |
| POST  | `/videos/import`        | `{ "input": "<RUTUBE URL или ID>" }`, импорт или обновление             |
| POST  | `/videos/:id/sync`      | Повторная синхронизация метаданных                                      |
| GET   | `/videos/:id/playback`  | `{ "url": "<временный HLS URL>" }`, `no-store`                          |
| GET   | `/videos/:id/thumbnail` | Проксирование обложки с CDN RUTUBE без сохранения файла                 |

Пример импорта:

```sh
curl -X POST http://localhost:3000/videos/import \
  -H 'Content-Type: application/json' \
  -d '{"input":"https://rutube.ru/video/f0ca53a0f70c1d02543a6939abf988cc/"}'
```

Проверки: `npm run build`, `npm test`. Архитектура описана в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Авторизация и пользовательские данные

`POST /auth/register` и `POST /auth/login` принимают `{ "email": "…", "password": "…" }` и возвращают `accessToken` и `refreshToken`. Email нормализуется; пароль от 10 символов хешируется bcrypt и не возвращается. Access token живёт 15 минут, refresh token — 30 дней и ротируется через `POST /auth/refresh` с телом `{ "refreshToken": "…" }`. `POST /auth/logout` и `GET /users/me` требуют `Authorization: Bearer <accessToken>`. Logout отзывает текущую сессию.

Тем же заголовком защищены все `/me/*`:

| Данные    | Методы и пути                                                                     |
| --------- | --------------------------------------------------------------------------------- |
| Избранное | `GET /me/favorites`, `POST/DELETE /me/favorites/:videoId`, `DELETE /me/favorites` |
| История   | `GET/DELETE /me/history`, `PUT/DELETE /me/history/:videoId`                       |
| Прогресс  | `GET/DELETE /me/progress`, `GET/PUT/DELETE /me/progress/:videoId`                 |

`PUT /me/history/:videoId` принимает необязательные `watchedAt`, `completed`; `PUT /me/progress/:videoId` — `positionSeconds`, `durationSeconds`, необязательный `observedAt`. Все операции ограничены текущим пользователем. Несуществующее видео при добавлении/обновлении даёт 404; отсутствие авторизации — 401. SQLite-модели `User`, `RefreshSession`, `Favorite`, `WatchHistory`, `PlaybackProgress` создаются Prisma migrations.
