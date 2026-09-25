# Структура мобильного приложения

```text
mobile/
├── android/                 # Нативный Android-проект
├── ios/                     # Нативный iOS-проект
├── src/                     # Прикладной TypeScript-код
│   ├── api/                 # Запросы к внешним API
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

Сейчас рабочий код находится в `api`, `components`, `constants`, `hooks`, `navigation`, `screens` и `types`. Остальные каталоги `src/` пока пусты и сохраняются с помощью `.gitkeep`; их назначение является целевой организацией кода. После добавления первого рабочего файла соответствующий `.gitkeep` удаляется.

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
├── HistoryScreen.tsx
└── SettingsScreen.tsx

src/components/icons/
├── FullscreenIcon.tsx
├── HomeIcon.tsx
├── SearchIcon.tsx
├── FavoritesIcon.tsx
├── HeartIcon.tsx
├── PauseIcon.tsx
├── PlayIcon.tsx
├── ProfileIcon.tsx
├── VideoPlaceholderIcon.tsx
├── VolumeIcon.tsx
├── navigationIcon.constants.ts
└── navigationIcon.types.ts

src/components/video/
├── VideoCard.tsx
└── VideoCard.styles.ts

src/components/player/
├── BasicVideoPlayer.tsx
├── BasicVideoPlayer.styles.ts
├── RutubeVideoPlayer.tsx
├── RutubeVideoPlayer.styles.ts
├── VideoControls.tsx
└── VideoControls.styles.ts

src/components/placeholder/
├── PlaceholderScreen.tsx
└── PlaceholderScreen.styles.ts

src/constants/
├── theme.ts                # Общие цвета интерфейса
└── videoCatalog.ts         # Локальные mock-данные каталога

src/api/
└── rutube.ts               # Получение временного URL видеопотока RUTUBE

src/hooks/
├── usePlayerControls.ts    # Автоматическое скрытие панели управления
├── usePlayerFullscreen.ts  # Fullscreen и реакция на ориентацию экрана
├── useRutubePlayer.reducer.ts # Локальные переходы состояния плеера
└── useRutubePlayer.ts      # Загрузка потока и жизненный цикл воспроизведения

src/types/
├── player.ts               # Состояния базового плеера
├── rutube.ts               # Минимальный контракт ответа RUTUBE
└── video.ts                # Модель видео для каталога и экрана деталей

src/utils/
└── formatPlaybackTime.ts   # Форматирование времени плеера
```

Нативная точка входа Android использует package/application ID `com.streambox`. Обе платформы запускают React Native-модуль `StreamBox`, зарегистрированный в `index.js`, и принимают deep links со схемой `streambox://`.

Каталоги `node_modules/`, `ios/Pods/`, `ios/build/`, `vendor/bundle/` и другие генерируемые артефакты не являются частью исходной архитектуры и не должны коммититься.
