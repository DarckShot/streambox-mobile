import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const placeholderScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    top: '24%',
    left: -48,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowDark: { backgroundColor: STREAMBOX_COLORS.glowDark },
  glowLight: { backgroundColor: STREAMBOX_COLORS.glowLight },
  card: {
    minHeight: 310,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  cardLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  brandMark: {
    width: 42,
    height: 6,
    marginBottom: 26,
    borderRadius: 3,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  eyebrow: {
    marginBottom: 12,
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.1,
  },
  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionDark: { color: STREAMBOX_COLORS.descriptionDark },
  descriptionLight: { color: STREAMBOX_COLORS.descriptionLight },
  detail: {
    alignSelf: 'flex-start',
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  detailDark: { borderColor: STREAMBOX_COLORS.detailBorderDark },
  detailLight: { borderColor: STREAMBOX_COLORS.detailBorderLight },
});
