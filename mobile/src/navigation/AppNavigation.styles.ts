import { StyleSheet } from 'react-native';

export const appNavigationStyles = StyleSheet.create({
  app: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  restoreError: { gap: 16 },
  migrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(17, 14, 31, 0.82)',
  },
  migrationText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
