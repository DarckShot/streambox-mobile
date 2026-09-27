# Архитектура StreamBox

```text
React Native ──HTTP──> NestJS API ──Prisma──> SQLite (локальный файл)
      │                    │
      │                    └── RutubeService ──HTTPS──> RUTUBE
      ├── TanStack Query: каталог, видео, playback
      └── Async Storage / Zustand: Favorites, History, progress, настройки
```

`GET /videos` и `GET /videos/:id` читают только SQLite. `POST /videos/import` и `POST /videos/:id/sync` получают метаданные RUTUBE, нормализуют их и обновляют запись по уникальному `externalId`. `GET /videos/:id/playback` получает временный HLS URL непосредственно перед воспроизведением; URL не записывается в SQLite и отдаётся с `Cache-Control: no-store`. Ошибки RUTUBE превращаются в контролируемые 404/502/503/504, не останавливая API.

Исходный URL обложки хранится в SQLite; мобильное приложение получает её через `GET /videos/:id/thumbnail`. Backend загружает изображение с доверенного CDN RUTUBE и не сохраняет файл.

База хранит `id`, `externalId`, `title`, `description`, `thumbnailUrl`, `duration` (секунды), `category`, `author`, `sourceUrl`, `createdAt`, `updatedAt`, `lastSyncedAt`. Дополнительное поле `searchTitle` содержит строчную форму названия для поиска в SQLite без учёта регистра, в API не выдаётся. Старые `video-001`…`video-008` сохраняются через карту идентификаторов по externalId. Новым видео назначается `rutube-<externalId>`. Миграция и начальный импорт разделены: первая создаёт схему, второй запрашивает реальные метаданные и может быть повторён при недоступности RUTUBE.

Мобильный API client расположен в `mobile/src/api`. В нём сосредоточены base URL, timeout, проверка формата ответа и классификация ошибок. Ключи TanStack Query находятся в `videoQueries.ts`; import/sync инвалидируют список и обновляют детальную запись. Zustand не дублирует серверный каталог: в нём хранятся только локальные пользовательские данные. Favorites и History хранят стабильные ID и загружают актуальные карточки через API; позиции просмотра остаются в Async Storage по videoId. Отсутствие backend показывает состояние ошибки и действие повтора, не подменяя данные mock-каталогом.

Подробнее: [backend](../backend/docs/ARCHITECTURE.md), [mobile](../mobile/docs/ARCHITECTURE.md).
