import { useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { useImportVideo } from '../../hooks/useVideoMutations';
import type { Video } from '../../types/video';
import { importVideoModalStyles as styles } from './ImportVideoModal.styles';

interface ImportVideoModalProps {
  onClose: () => void;
  onImported: (video: Video) => void;
  visible: boolean;
}

export const ImportVideoModal = ({
  onClose,
  onImported,
  visible,
}: ImportVideoModalProps): ReactElement => {
  const { colors, dark } = useTheme();
  const [input, setInput] = useState('');
  const mutation = useImportVideo();

  const submit = async (): Promise<void> => {
    if (!input.trim() || mutation.isPending) return;
    try {
      const video = await mutation.mutateAsync(input.trim());
      setInput('');
      onClose();
      onImported(video);
    } catch {
      /* Сообщение об ошибке показывается под полем. */
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Добавить видео</Text>
          <Text
            style={[
              styles.description,
              {
                color: dark ? STREAMBOX_COLORS.descriptionDark : STREAMBOX_COLORS.descriptionLight,
              },
            ]}
          >
            Вставьте ссылку RUTUBE или ID видео. Метаданные загрузятся через сервер.
          </Text>
          <TextInput
            accessibilityLabel="Ссылка или ID RUTUBE"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setInput}
            placeholder="https://rutube.ru/video/…"
            placeholderTextColor={STREAMBOX_COLORS.descriptionLight}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={input}
          />
          {mutation.error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {mutation.error.message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
              <Text style={{ color: colors.text }}>Отмена</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!input.trim() || mutation.isPending}
              onPress={submit}
              style={[
                styles.submitButton,
                !input.trim() || mutation.isPending ? styles.disabled : null,
              ]}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Добавить</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
