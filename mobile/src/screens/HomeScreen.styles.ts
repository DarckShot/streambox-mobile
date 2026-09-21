import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const homeScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  header: {
    gap: 10,
    paddingTop: 22,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 30,
    height: 5,
    borderCurve: 'continuous',
    borderRadius: 3,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  brand: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  subtitle: {
    maxWidth: 310,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitleDark: {
    color: STREAMBOX_COLORS.descriptionDark,
  },
  subtitleLight: {
    color: STREAMBOX_COLORS.descriptionLight,
  },
  separator: {
    height: 16,
  },
});
