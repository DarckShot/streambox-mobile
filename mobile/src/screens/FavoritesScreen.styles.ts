import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const favoritesScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  eyebrow: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  subtitleDark: {
    color: STREAMBOX_COLORS.descriptionDark,
  },
  subtitleLight: {
    color: STREAMBOX_COLORS.descriptionLight,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  separator: {
    height: 16,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: STREAMBOX_COLORS.glowDark,
  },
  stateTitle: {
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 22,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  actionButtonText: {
    color: STREAMBOX_COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  errorBanner: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
