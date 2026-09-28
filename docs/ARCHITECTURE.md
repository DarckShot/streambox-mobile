# Архитектура StreamBox

```text
React Native ──HTTP──> NestJS API ──Prisma──> SQLite (локальный файл)
      │                    │
      │                    └── RutubeService ──HTTPS──> RUTUBE
      ├── TanStack Query: каталог, видео, playback, пользовательские данные
      ├── Keychain/Keystore: refresh token
      └── Async Storage / Zustand: настройки и legacy-миграция
```

`GET /videos` и `GET /videos/:id` читают только SQLite. `POST /videos/import` и `POST /videos/:id/sync` получают метаданные RUTUBE, нормализуют их и обновляют запись по уникальному `externalId`. `GET /videos/:id/playback` получает временный HLS URL непосредственно перед воспроизведением; URL не записывается в SQLite и отдаётся с `Cache-Control: no-store`. Ошибки RUTUBE превращаются в контролируемые 404/502/503/504, не останавливая API.

Исходный URL обложки хранится в SQLite; мобильное приложение получает её через `GET /videos/:id/thumbnail`. Backend загружает изображение с доверенного CDN RUTUBE и не сохраняет файл.

База хранит `id`, `externalId`, `title`, `description`, `thumbnailUrl`, `duration` (секунды), `category`, `author`, `sourceUrl`, `createdAt`, `updatedAt`, `lastSyncedAt`. Дополнительное поле `searchTitle` содержит строчную форму названия для поиска в SQLite без учёта регистра, в API не выдаётся. Старые `video-001`…`video-008` сохраняются через карту идентификаторов по externalId. Новым видео назначается `rutube-<externalId>`. Миграция и начальный импорт разделены: первая создаёт схему, второй запрашивает реальные метаданные и может быть повторён при недоступности RUTUBE.

Мобильный API client расположен в `mobile/src/api`. В нём сосредоточены base URL, timeout, проверка формата ответа и классификация ошибок. Ключи TanStack Query находятся в `videoQueries.ts`; import/sync инвалидируют список и обновляют детальную запись. TanStack Query хранит пользовательский server state отдельно по userId; logout очищает приватный кэш. Favorites, History и progress хранятся в SQLite по паре userId/videoId и доступны только по JWT. Legacy-данные Async Storage синхронизируются после первого входа и затем удаляются. Zustand остаётся только для локальных настроек. Отсутствие backend показывает состояние ошибки и действие повтора, не подменяя данные mock-каталогом.

Подробнее: [backend](../backend/docs/ARCHITECTURE.md), [mobile](../mobile/docs/ARCHITECTURE.md).

Offline-слой использует NetInfo и AppState: TanStack Query повторяет только временные сетевые ошибки и отдельные 5xx, обновляя устаревший кеш после reconnect/foreground. Успешные публичные запросы каталога и деталей сохраняются отдельно от пользовательских Favorites, History, progress и профиля; каждый пользовательский кеш имеет свой ключ по userId. Временные playback URL не персистятся. Keychain/Keystore хранит refresh token и последнюю подтверждённую идентичность для открытия своего кеша без сети. Изменения пользовательских данных сначала попадают в persistent offline queue, затем в NestJS; очередь объединяет последние действия над одним видео. Zustand остаётся для локальных настроек и поиска, а server state принадлежит TanStack Query.
