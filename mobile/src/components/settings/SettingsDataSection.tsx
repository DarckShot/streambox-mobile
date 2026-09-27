import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

import { useClearUserData, useUserCollections } from '../../hooks/useUserData';
import { ClearDataRow } from './ClearDataRow';
import { settingsScreenStyles as styles } from './settingsStyles';

export const SettingsDataSection = (): ReactElement => {
  const { colors, dark } = useTheme();
  const { userId, favorites, history, progress } = useUserCollections();
  const clear = useClearUserData(userId);
  const historyCount = history.data?.length ?? 0;
  const progressCount = progress.data?.length ?? 0;
  const favoriteCount = favorites.data?.length ?? 0;

  return (
    <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои данные</Text>
      <Text style={styles.sectionDescription}>
        Удаление данных нельзя отменить. Каждый раздел очищается отдельно.
      </Text>
      <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
        <ClearDataRow
          title="Очистить историю"
          description={`Просмотрено: ${historyCount}`}
          confirmationTitle="Очистить историю?"
          confirmationMessage="Все записи о просмотренных видео будут удалены."
          errorTitle="Не удалось очистить историю"
          disabled={history.isPending || clear.history.isPending || historyCount === 0}
          onClear={() => clear.history.mutateAsync()}
        />
        <View style={styles.divider} />
        <ClearDataRow
          title="Сбросить прогресс"
          description={`Видео с сохранённой позицией: ${progressCount}`}
          confirmationTitle="Сбросить прогресс?"
          confirmationMessage="Сохранённые позиции всех видео будут удалены."
          errorTitle="Не удалось сбросить прогресс"
          disabled={progress.isPending || clear.progress.isPending || progressCount === 0}
          onClear={() => clear.progress.mutateAsync()}
        />
        <View style={styles.divider} />
        <ClearDataRow
          title="Очистить избранное"
          description={`Видео в избранном: ${favoriteCount}`}
          confirmationTitle="Очистить избранное?"
          confirmationMessage="Все видео будут удалены из избранного."
          errorTitle="Не удалось очистить избранное"
          disabled={favorites.isPending || clear.favorites.isPending || favoriteCount === 0}
          onClear={() => clear.favorites.mutateAsync()}
        />
      </View>
    </>
  );
};
