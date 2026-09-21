# StreamBox

StreamBox — проект сервиса для работы с медиаконтентом. Репозиторий разделён на мобильный клиент и backend.

## Состав проекта

```text
streambox-mobile/
├── mobile/       # React Native-клиент для Android и iOS
├── backend/      # Серверная часть; реализация ещё не начата
├── docs/         # Общая и компонентная документация
└── README.md     # Общая точка входа
```

## Компоненты

### Mobile

Мобильное приложение уже инициализировано на React Native и TypeScript. Прикладные модули пока представлены пустой структурой каталогов.

- [README мобильного приложения](mobile/README.md)
- [Архитектура mobile](mobile/docs/ARCHITECTURE.md)
- [Структура mobile](mobile/docs/PROJECT_STRUCTURE.md)
- [Окружение mobile](mobile/docs/ENVIRONMENT.md)
- [Релизы mobile](mobile/docs/RELEASE.md)

### Backend

Каталог backend создан, но язык, фреймворк, API и способ развёртывания пока не выбраны.

- [README backend](backend/README.md)
- [Архитектура backend](backend/docs/ARCHITECTURE.md)

## Общая документация

- [Архитектура всей системы](docs/ARCHITECTURE.md)
- [Правила разработки](docs/CONTRIBUTING.md)
- [История изменений](docs/CHANGELOG.md)

## Статус

Мобильная часть содержит чистую базовую конфигурацию React Native без продуктовых экранов. Backend ещё не реализован. Документы с будущими решениями явно помечены как целевая архитектура, чтобы не смешивать планы с фактическим состоянием.
