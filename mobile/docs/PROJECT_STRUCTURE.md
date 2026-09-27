# Структура мобильного приложения

`App.tsx` подключает навигацию, Safe Area и TanStack Query. `src/navigation/` содержит вкладки, stack и маршруты `streambox://`.

- `src/api/` — общий HTTP client, типизированные запросы к backend и ключи TanStack Query.
- `src/config/` — выбор адреса backend для iOS Simulator, Android Emulator и устройства из `.env`.
- `src/screens/` — Home, Search, VideoDetails, Player, Favorites, History, Profile и Settings.
- `src/components/` — карточки, импорт видео, кнопки и пользовательские controls плеера.
- `src/hooks/` — загрузка связанных видео, воспроизведение, fullscreen и локальный прогресс.
- `src/storage/` и `src/store/` — локальные Favorites, History, progress и настройки через Async Storage и Zustand.
- `src/types/` и `src/utils/` — модели приложения и вспомогательные функции.

Каталог и playback доступны только через NestJS backend. Локального mock-каталога и прямого API-клиента RUTUBE в мобильном приложении нет. Подробности — в [архитектуре](ARCHITECTURE.md).
