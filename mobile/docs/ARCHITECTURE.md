# Архитектура мобильного приложения

`App.tsx` содержит SafeAreaProvider, QueryClientProvider и NavigationContainer. React Navigation использует native stack и вкладки Home, Search, Favorites, Profile; deep links `streambox://` ведут на эти экраны, History, Settings, VideoDetails и Player.

Каталог, поиск и детали загружаются через `src/api/client.ts` и `src/api/videos.ts`. Base URL приходит из `.env` через нативный `react-native-config`; `apiConfig.ts` выбирает URL для iOS Simulator, Android Emulator или физического устройства. API client задаёт timeout и переводит сетевые ошибки, 404 и неверный ответ в типизированные ошибки. Компоненты не вызывают `fetch` и не обращаются напрямую к RUTUBE.

Для карточек API client преобразует исходный URL обложки в `/videos/:id/thumbnail`; изображение загружается через backend. При недоступной обложке карточка показывает заглушку.

`videoQueries.ts` содержит общие query keys и параметры кэша. Home запрашивает `/videos`, Search — `/videos?search=` после debounce, VideoDetails — `/videos/:id`, Player — `/videos/:id/playback`. Import и sync выполняются мутациями; они обновляют кэш видео и инвалидируют каталог. Повторное открытие экранов использует кэш с минутным stale time. При сетевой ошибке экран показывает повтор запроса. Временный playback URL имеет нулевой срок хранения в кэше и не записывается локально.

Избранное, история, позиции и настройки — локальные пользовательские данные в Async Storage; Zustand объединяет подписки между экранами. Они хранят стабильные `videoId`, а карточки Favorites/History получают актуальные серверные данные через Query. `useVideoProgress` сохраняет позицию во время просмотра, при seek и уходе с Player; по завершении удаляет её. Fullscreen и custom controls остались в локальной логике плеера. Серверное состояние не копируется в Zustand.

[Общая архитектура](../../docs/ARCHITECTURE.md) · [Backend](../../backend/docs/ARCHITECTURE.md).
