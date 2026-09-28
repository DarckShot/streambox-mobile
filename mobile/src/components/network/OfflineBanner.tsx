import { createContext, useContext, useState, type ReactElement, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useQueryClient } from '@tanstack/react-query';

import { refreshNetworkState, useOnline } from '../../services/networkState';
import { useSyncFailure } from '../../services/offlineQueue';
import { useAuth } from '../../auth/AuthProvider';

const styles = StyleSheet.create({
  layout: { flex: 1 },
  banner: { backgroundColor: '#4B386B', paddingHorizontal: 16, paddingVertical: 10 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8B9FA' },
  copy: { flex: 1, gap: 2 },
  title: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  description: { color: '#E0D4EF', fontSize: 11, lineHeight: 15 },
  action: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  actionPressed: { opacity: 0.7 },
});

const BannerVisibleContext = createContext(false);

export const useBannerVisible = (): boolean => useContext(BannerVisibleContext);

export const OfflineBanner = ({ children }: { children: ReactNode }): ReactElement => {
  const online = useOnline();
  const [checking, setChecking] = useState(false);
  const auth = useAuth();
  const client = useQueryClient();
  const userId =
    auth.status === 'authenticated'
      ? client.getQueryData<{ id: string }>(['session', 'me'])?.id ?? ''
      : '';
  const failure = useSyncFailure(userId);
  const visible = !online || Boolean(failure);
  const checkConnection = async (): Promise<void> => {
    if (checking) return;
    setChecking(true);
    try {
      await refreshNetworkState();
    } finally {
      setChecking(false);
    }
  };
  return (
    <BannerVisibleContext.Provider value={visible}>
      <View style={styles.layout}>
        {visible ? (
          <SafeAreaView
            accessibilityRole="alert"
            edges={['top', 'left', 'right']}
            style={styles.banner}
          >
            <View style={styles.content}>
              <View style={styles.statusDot} />
              <View style={styles.copy}>
                <Text style={styles.title}>
                  {online ? 'Не удалось синхронизировать' : 'Нет подключения'}
                </Text>
                <Text style={styles.description}>
                  {online ? failure : 'Данные доступны офлайн. Изменения отправим позже.'}
                </Text>
              </View>
              {!online ? (
                <Pressable
                  accessibilityLabel="Проверить подключение"
                  accessibilityRole="button"
                  disabled={checking}
                  hitSlop={4}
                  onPress={checkConnection}
                  style={({ pressed }) => [styles.action, pressed ? styles.actionPressed : null]}
                >
                  {checking ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </Pressable>
              ) : null}
            </View>
          </SafeAreaView>
        ) : null}
        {children}
      </View>
    </BannerVisibleContext.Provider>
  );
};
