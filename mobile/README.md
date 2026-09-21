# StreamBox Mobile

Мобильный клиент StreamBox для Android и iOS на React Native и TypeScript.

## Текущее состояние

Проект содержит чистую базу React Native без демонстрационного экрана. `App.tsx` задаёт корневую safe area, светлый или тёмный фон по системной теме и соответствующий `StatusBar`. Навигация, API-клиент, глобальное состояние и продуктовые экраны пока не реализованы.

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

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Структура каталогов](docs/PROJECT_STRUCTURE.md)
- [Настройка окружения](docs/ENVIRONMENT.md)
- [Подготовка релиза](docs/RELEASE.md)
