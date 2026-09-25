# Релиз мобильного приложения

## Текущая готовность

Приложение не готово к публикации:

- Android release-сборка подписывается debug-ключом;
- минификация Android release-сборки отключена;
- iOS использует шаблонный bundle identifier `org.reactjs.native.example.StreamBox`;
- реализованы каталог, экран деталей и базовое воспроизведение RUTUBE-видео; остальные продуктовые сценарии и backend-интеграция отсутствуют.

## Общий чек-лист

1. Обновить общую историю изменений.
2. Запустить lint, TypeScript и тесты.
3. Обновить версии и номера сборок обеих платформ.
4. Проверить чистые release-сборки.
5. Выполнить smoke-тест на реальных устройствах.
6. Проверить production-конфигурацию, иконки, splash screen и privacy declarations.
7. Проверить итоговые артефакты и только затем создать Git-тег.

## Android

- Создать отдельный upload/release keystore и хранить его вне репозитория.
- Передавать реквизиты подписи через секреты локального окружения или CI.
- Убрать `signingConfigs.debug` из release build type.
- Настроить и проверить R8/Proguard при включении минификации.
- Собрать AAB: `cd android && ./gradlew bundleRelease`.

Production keystore нельзя терять: без него обновление опубликованного приложения может стать невозможным.

## iOS

- Заменить шаблонный bundle identifier на зарегистрированный.
- Настроить Apple Developer Team, сертификаты и provisioning profiles.
- Обновить `MARKETING_VERSION` и `CURRENT_PROJECT_VERSION`.
- Собрать Archive в Xcode и выполнить Validate App.
- Проверить Privacy Manifest и сведения App Privacy.
