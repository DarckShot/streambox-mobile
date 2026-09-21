# Окружение мобильного приложения

## Общие требования

- Node.js `>= 22.11.0`;
- npm;
- Git.

Установка JavaScript-зависимостей из `mobile/`:

```sh
npm install
```

## Android

Нужны Android Studio, Android SDK, совместимая JDK и эмулятор либо подключённое устройство.

```sh
npm start
```

В другом терминале:

```sh
npm run android
```

Файл `android/local.properties` локальный и не коммитится.

## iOS

Сборка доступна на macOS. Нужны Xcode, Xcode Command Line Tools и Ruby `3.2.10`.

```sh
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

После изменения нативных npm-зависимостей необходимо повторно установить Pods.

## Переменные окружения

Механизм переменных окружения пока не настроен. При его добавлении следует коммитить пример без секретов, разделить development/staging/production и описать каждую переменную. Реальные секреты нельзя хранить в Git или полагаться на секретность содержимого мобильного bundle.

## Диагностика

- Сброс кеша Metro: `npm start -- --reset-cache`.
- Список Android-устройств: `adb devices`.
- CocoaPods следует запускать через `bundle exec`, чтобы использовать зафиксированные версии.
