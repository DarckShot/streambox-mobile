import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const searchScreenStyles = StyleSheet.create({
  screen: { flex: 1 },
  header: { gap: 8, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 20 },
  eyebrow: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1.1, lineHeight: 40 },
  subtitle: { fontSize: 15, lineHeight: 21 },
  subtitleDark: { color: STREAMBOX_COLORS.descriptionDark },
  subtitleLight: { color: STREAMBOX_COLORS.descriptionLight },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputDark: { backgroundColor: STREAMBOX_COLORS.glowDark, borderColor: STREAMBOX_COLORS.glowDark },
  inputLight: { backgroundColor: STREAMBOX_COLORS.white, borderColor: '#E7E4F1' },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  clearButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 28, lineHeight: 31 },
  listContent: { paddingHorizontal: 18, paddingBottom: 28 },
  separator: { height: 16 },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  stateTitle: { fontSize: 23, fontWeight: '800', textAlign: 'center' },
  stateDescription: { fontSize: 15, lineHeight: 23, textAlign: 'center' },
});
