import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const videoDetailsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  cover: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#22202E',
  },
  coverFallback: {
    alignItems: 'center',
    gap: 10,
  },
  coverFallbackText: {
    color: '#77738D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  coverImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    borderCurve: 'continuous',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(10, 9, 15, 0.84)',
  },
  durationText: {
    color: STREAMBOX_COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  details: {
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryMark: {
    width: 8,
    height: 8,
    borderCurve: 'continuous',
    borderRadius: 4,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  category: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 37,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  metaLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dividerDark: {
    borderTopColor: STREAMBOX_COLORS.detailBorderDark,
  },
  dividerLight: {
    borderTopColor: STREAMBOX_COLORS.detailBorderLight,
  },
  descriptionBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
  },
  textDark: {
    color: STREAMBOX_COLORS.descriptionDark,
  },
  textLight: {
    color: STREAMBOX_COLORS.descriptionLight,
  },
  actions: {
    gap: 12,
    paddingTop: 8,
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderCurve: 'continuous',
    borderRadius: 17,
    paddingHorizontal: 20,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  primaryButtonText: {
    color: STREAMBOX_COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
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
  secondaryButtonDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  secondaryButtonLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    borderCurve: 'continuous',
    borderRadius: 28,
    padding: 28,
  },
  surfaceDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  surfaceLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  errorIcon: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: 28,
    backgroundColor: STREAMBOX_COLORS.glowDark,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
});
