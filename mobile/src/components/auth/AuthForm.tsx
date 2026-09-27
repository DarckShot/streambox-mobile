import { useTheme } from '@react-navigation/native';
import { useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import { useAuth } from '../../auth/AuthProvider';
import { authStyles as styles } from './AuthForm.styles';

interface AuthFormProps {
  mode: 'login' | 'register';
  onAlternate: () => void;
}

export const AuthForm = ({ mode, onAlternate }: AuthFormProps): ReactElement => {
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === 'register';

  const submit = async (): Promise<void> => {
    if (pending) return;
    if (password.length < 10) {
      setError('Пароль должен содержать не менее 10 символов.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await (isRegister ? register(email.trim(), password) : login(email.trim(), password));
    } catch (reason: unknown) {
      const message = axios.isAxiosError(reason) ? reason.response?.data?.message : null;
      setError(
        typeof message === 'string'
          ? message
          : Array.isArray(message) && message.every((item) => typeof item === 'string')
          ? message.join(' ')
          : 'Не удалось подключиться. Проверьте соединение и попробуйте ещё раз.',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>STREAMBOX</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {isRegister ? 'Создать аккаунт' : 'С возвращением'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {isRegister
              ? 'Сохраняйте избранное и продолжайте просмотр на другом устройстве.'
              : 'Войдите, чтобы увидеть ваши видео и продолжить просмотр.'}
          </Text>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#77738D"
            style={[styles.field, { color: colors.text, borderColor: colors.border }]}
            value={email}
          />
          <TextInput
            accessibilityLabel="Пароль"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            onChangeText={setPassword}
            placeholder="Пароль"
            placeholderTextColor="#77738D"
            secureTextEntry
            style={[styles.field, { color: colors.text, borderColor: colors.border }]}
            value={password}
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={pending || !email.trim() || !password}
            onPress={submit}
            style={styles.button}
          >
            {pending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{isRegister ? 'Зарегистрироваться' : 'Войти'}</Text>
            )}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onAlternate} style={styles.secondary}>
            <Text style={styles.secondaryText}>
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
