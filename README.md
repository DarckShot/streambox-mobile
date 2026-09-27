# StreamBox

StreamBox — React Native-приложение с локальным NestJS API. Каталог и воспроизведение работают по цепочке **React Native → NestJS → SQLite / RUTUBE**. Сервер хранит нормализованные метаданные в SQLite; временные playback URL запрашивает у RUTUBE по требованию. Авторизация и пользовательские Favorites, History и progress работают через JWT и SQLite; настройки остаются на устройстве.

## Структура

- `mobile/` — iOS/Android-клиент, React Navigation, TanStack Query, Keychain для refresh token, TanStack Query для пользовательских данных и Async Storage для настроек.
- `backend/` — NestJS API, Prisma, SQLite и слой интеграции `RutubeService`.
- `docs/ARCHITECTURE.md` — границы системы и поток данных.

## Быстрый запуск

```sh
cd backend
npm install
npm run setup:env
npm run prisma:deploy
npm run seed:legacy
npm run start:dev
```

В другом терминале:

```sh
cd mobile
npm install
cp .env.example .env
npm start
npm run ios # или npm run android
```

`backend` создаёт локальные JWT-секреты командой `setup:env` и сохраняет их между запусками; не копируйте `.env.example` поверх существующего `.env`. Первый импорт `seed:legacy` получает **реальные** метаданные RUTUBE для восьми старых ID `video-001`…`video-008`. Команду можно повторить: записи обновятся, дублей не будет. Новые видео можно добавлять кнопкой на Home или `POST /videos/import`. Backend должен быть запущен, пока приложение использует каталог. Для физического устройства задайте в `mobile/.env` `API_BASE_URL_DEVICE=http://<LAN-IP-компьютера>:3000` и пересоберите JS-бандл; телефон и компьютер должны находиться в одной сети.

Команды, переменные и ограничения описаны в [backend README](backend/README.md) и [mobile README](mobile/README.md).
