# Структура мобильного приложения

```text
mobile/
├── android/                 # Нативный Android-проект
├── ios/                     # Нативный iOS-проект
├── src/                     # Заготовка прикладного TypeScript-кода
│   ├── api/                 # Будущий API-слой
│   ├── assets/
│   │   ├── icons/           # Иконки
│   │   └── images/          # Изображения
│   ├── components/          # Общие UI-компоненты
│   ├── constants/           # Константы и конфигурационные значения
│   ├── hooks/               # React-хуки
│   ├── navigation/          # Навигация и типы маршрутов
│   ├── providers/           # Глобальные React-провайдеры
│   ├── screens/             # Экраны
│   ├── services/            # Сервисы и платформенные интеграции
│   ├── store/               # Глобальное клиентское состояние
│   ├── types/               # Общие TypeScript-типы
│   └── utils/               # Вспомогательные функции
├── __tests__/               # Тесты
├── App.tsx                  # Корневой React-компонент
├── index.js                 # Регистрация нативного модуля
├── app.json                 # Имя приложения StreamBox
├── package.json             # npm-зависимости и команды
├── tsconfig.json            # TypeScript
├── babel.config.js          # Babel
├── metro.config.js          # Metro
└── jest.config.js           # Jest
```

`src/` пока состоит из пустых каталогов с `.gitkeep`. Назначение каталогов является целевой организацией кода. После добавления первого рабочего файла соответствующий `.gitkeep` можно удалить.

Нативная точка входа Android использует package/application ID `com.streambox`. Обе платформы запускают React Native-модуль `StreamBox`, зарегистрированный в `index.js`.

Каталоги `node_modules/`, `ios/Pods/`, `ios/build/`, `vendor/bundle/` и другие генерируемые артефакты не являются частью исходной архитектуры и не должны коммититься.
