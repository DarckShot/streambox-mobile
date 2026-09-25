# Структура мобильного приложения

```text
mobile/
├── android/                 # Нативный Android-проект
├── ios/                     # Нативный iOS-проект
├── src/                     # Прикладной TypeScript-код
│   ├── api/                 # Будущий API-слой
│   ├── assets/
│   │   ├── icons/           # Иконки
│   │   └── images/          # Изображения
│   ├── components/          # Общие UI-компоненты и SVG-иконки
│   ├── constants/           # Константы и конфигурационные значения
│   ├── hooks/               # React-хуки
│   ├── navigation/          # Навигаторы, маршруты, параметры и deep links
│   ├── providers/           # Глобальные React-провайдеры
│   ├── screens/             # Экраны и их временные заглушки
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

Сейчас рабочий код находится в `components`, `constants`, `navigation`, `screens` и `types`. Остальные каталоги `src/` пока пусты и сохраняются с помощью `.gitkeep`; их назначение является целевой организацией кода. После добавления первого рабочего файла соответствующий `.gitkeep` удаляется.

```text
src/navigation/
├── components/             # Элементы интерфейса, относящиеся к навигации
├── MainTabNavigator.tsx    # Вкладки Home, Search, Favorites и Profile
├── MainTabNavigator.styles.ts
├── RootNavigator.tsx       # Корневой native stack
├── linking.ts              # Deep-link конфигурация streambox://
├── routes.ts               # Имена маршрутов и внешние пути
└── types.ts                # Параметры маршрутов

src/screens/
├── HomeScreen.tsx
├── HomeScreen.styles.ts
├── SearchScreen.tsx
├── FavoritesScreen.tsx
├── ProfileScreen.tsx
├── VideoDetailsScreen.tsx
├── VideoDetailsScreen.styles.ts
├── PlayerScreen.tsx
├── HistoryScreen.tsx
└── SettingsScreen.tsx

src/components/icons/
├── HomeIcon.tsx
├── SearchIcon.tsx
├── FavoritesIcon.tsx
├── HeartIcon.tsx
├── PlayIcon.tsx
├── ProfileIcon.tsx
├── VideoPlaceholderIcon.tsx
├── navigationIcon.constants.ts
└── navigationIcon.types.ts

src/components/video/
├── VideoCard.tsx
└── VideoCard.styles.ts

src/components/placeholder/
├── PlaceholderScreen.tsx
└── PlaceholderScreen.styles.ts

src/constants/
├── theme.ts                # Общие цвета интерфейса
└── videoCatalog.ts         # Локальные mock-данные каталога

src/types/
└── video.ts                # Модель видео для каталога и экрана деталей
```

Нативная точка входа Android использует package/application ID `com.streambox`. Обе платформы запускают React Native-модуль `StreamBox`, зарегистрированный в `index.js`, и принимают deep links со схемой `streambox://`.

Каталоги `node_modules/`, `ios/Pods/`, `ios/build/`, `vendor/bundle/` и другие генерируемые артефакты не являются частью исходной архитектуры и не должны коммититься.
