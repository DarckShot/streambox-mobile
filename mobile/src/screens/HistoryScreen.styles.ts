import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../constants/theme';

export const historyScreenStyles = StyleSheet.create({
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
  clearButton: { alignSelf: 'flex-start', paddingVertical: 8 },
  clearText: { color: STREAMBOX_COLORS.accent, fontSize: 15, fontWeight: '700' },
  listContent: { paddingHorizontal: 18, paddingBottom: 28 },
  item: { marginBottom: 18 },
  footer: {
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 17,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerDark: { borderTopColor: STREAMBOX_COLORS.cardBorderDark },
  footerLight: { borderTopColor: STREAMBOX_COLORS.cardBorderLight },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: { color: STREAMBOX_COLORS.accent, fontSize: 12, fontWeight: '800' },
  progressValue: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], flexShrink: 1 },
  dateText: { fontSize: 12 },
  textDark: { color: STREAMBOX_COLORS.descriptionDark },
  textLight: { color: STREAMBOX_COLORS.descriptionLight },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: STREAMBOX_COLORS.glowDark,
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: STREAMBOX_COLORS.accent },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  stateTitle: { fontSize: 23, fontWeight: '800', textAlign: 'center' },
  stateText: { fontSize: 15, lineHeight: 23, textAlign: 'center' },
  error: { color: STREAMBOX_COLORS.errorLight, paddingHorizontal: 20, paddingBottom: 12 },
});
