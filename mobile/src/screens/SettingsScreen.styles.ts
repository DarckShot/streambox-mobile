import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const settingsScreenStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  eyebrow: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '800', marginTop: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800', marginTop: 30, marginBottom: 12 },
  sectionDescription: {
    color: STREAMBOX_COLORS.descriptionLight,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  cardDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  cardLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  row: {
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowContent: { flex: 1, gap: 5 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  description: { color: STREAMBOX_COLORS.descriptionLight, fontSize: 13, lineHeight: 18 },
  danger: { color: '#CF4B56', fontSize: 16, fontWeight: '700' },
  chevron: { color: STREAMBOX_COLORS.accent, fontSize: 27 },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: STREAMBOX_COLORS.cardBorderLight,
    marginLeft: 18,
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
});
