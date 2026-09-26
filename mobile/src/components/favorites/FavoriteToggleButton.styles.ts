import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const favoriteToggleButtonStyles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderCurve: 'continuous',
    borderRadius: 17,
    paddingHorizontal: 20,
  },
  buttonCompact: {
    minHeight: 42,
    borderRadius: 14,
  },
  buttonDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  buttonLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  retryText: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
