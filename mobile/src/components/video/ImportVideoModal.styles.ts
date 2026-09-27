import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const importVideoModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: 'rgba(10, 8, 20, 0.6)',
  },
  card: { borderRadius: 24, padding: 22, gap: 14 },
  title: { fontSize: 24, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: { color: STREAMBOX_COLORS.errorLight, fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  cancelButton: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  submitButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  submitText: { color: STREAMBOX_COLORS.white, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
