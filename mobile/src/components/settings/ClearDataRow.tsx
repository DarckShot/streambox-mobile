import type { ReactElement } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { settingsScreenStyles as styles } from './settingsStyles';

interface ClearDataRowProps {
  title: string;
  description: string;
  confirmationTitle: string;
  confirmationMessage: string;
  errorTitle: string;
  disabled: boolean;
  onClear: () => Promise<void>;
}

export const ClearDataRow = ({
  title,
  description,
  confirmationTitle,
  confirmationMessage,
  errorTitle,
  disabled,
  onClear,
}: ClearDataRowProps): ReactElement => {
  const clear = (): void => {
    onClear().catch(() => Alert.alert(errorTitle, 'Проверьте соединение и повторите.'));
  };
  const confirm = (): void => {
    Alert.alert(confirmationTitle, confirmationMessage, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={confirm}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.rowContent}>
        <Text style={styles.danger}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};
