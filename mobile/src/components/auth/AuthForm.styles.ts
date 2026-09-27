import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const authStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 18,
  },
  brand: { color: STREAMBOX_COLORS.accent, fontSize: 14, fontWeight: '900', letterSpacing: 3 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  field: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, minHeight: 54, fontSize: 16 },
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondary: { alignSelf: 'center', paddingVertical: 10 },
  secondaryText: { color: STREAMBOX_COLORS.accent, fontSize: 15, fontWeight: '700' },
  error: { color: '#D04555', fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
