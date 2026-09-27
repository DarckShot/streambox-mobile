# StreamBox Mobile

React Native-клиент для iOS и Android. Каталог, поиск, детали и playback получают данные только от локального NestJS backend через единый API client и TanStack Query. Прямых вызовов RUTUBE и mock-каталога в приложении нет. Favorites, History, позиции и настройки сохраняются на устройстве.

## Запуск

Сначала запустите backend по [инструкции](../backend/README.md). Затем из `mobile/`:

```sh
npm install
cp .env.example .env
npm start
npm run ios # или npm run android
```

По умолчанию iOS Simulator обращается к `http://localhost:3000`, Android Emulator — к `http://10.0.2.2:3000`. Для физического устройства укажите `API_BASE_URL_DEVICE=http://<LAN-IP-компьютера>:3000` в `.env`; после изменения `.env` перезапустите Metro с очисткой кеша и пересоберите приложение. Backend слушает все интерфейсы. Для release укажите доступный устройству HTTPS backend; Android release не разрешает cleartext HTTP. `.env` не коммитится, `.env.example` — шаблон.

Home показывает каталог, позволяет импортировать RUTUBE URL/ID и обновить список. VideoDetails показывает серверные метаданные и позволяет повторно синхронизировать их; Player получает временную ссылку с backend. Search выполняет серверный поиск с debounce. Временная недоступность backend показывает ошибку и кнопку повтора.

## Проверки

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand --watch=false
```

После изменения нативной конфигурации заново соберите iOS/Android-приложение. [Архитектура](docs/ARCHITECTURE.md).
