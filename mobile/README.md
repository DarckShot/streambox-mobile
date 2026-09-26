# StreamBox Mobile

Мобильный клиент StreamBox для Android и iOS на React Native и TypeScript.

## Текущее состояние

В приложение подключён React Navigation: корневой native stack, нижняя панель вкладок и типизированные параметры маршрутов. На Home реализован каталог на `FlashList` с локальными mock-данными RUTUBE. Выбор карточки открывает `VideoDetails` по внутреннему `videoId`; на этом же экране отображаются метаданные и встроенный плеер. Axios получает временный HLS URL из RUTUBE API, а `react-native-video` обеспечивает play/pause, seek по тапу и свайпу на таймлайне, перемотку на ±10 секунд, mute, fullscreen, loading, buffering, завершение и состояния ошибки. Позиция каждого видео сохраняется локально через Async Storage и восстанавливается при следующем открытии; после полного просмотра она сбрасывается. Остальные продуктовые маршруты представлены экранами-заглушками, логика избранного не реализована. `App.tsx` настраивает safe area, системную тему, `StatusBar` и корневой контейнер навигации.

Поддерживаются deep links через схему `streambox://`, например:

```text
streambox://search
streambox://videos/42
streambox://profile/history
streambox://settings
```

## Требования

- Node.js `>= 22.11.0`;
- npm;
- Android Studio, Android SDK и совместимая JDK для Android;
- macOS, Xcode, Ruby `3.2.10` и CocoaPods через Bundler для iOS.

## Установка

Команды выполняются из каталога `mobile/`:

```sh
npm install
```

Для iOS:

```sh
bundle install
bundle exec pod install --project-directory=ios
```

## Запуск

Запустите Metro:

```sh
npm start
```

В другом терминале запустите платформу:

```sh
npm run android
# или
npm run ios
```

## Проверки

```sh
npm run lint
npm test
npx tsc --noEmit
```

После изменения нативных зависимостей повторно выполните `bundle exec pod install --project-directory=ios` и пересоберите приложение через `npm run ios` или `npm run android`. Обновление JavaScript через Metro не добавляет новые нативные модули в уже установленное приложение.

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Структура каталогов](docs/PROJECT_STRUCTURE.md)
- [Настройка окружения](docs/ENVIRONMENT.md)
- [Подготовка релиза](docs/RELEASE.md)
