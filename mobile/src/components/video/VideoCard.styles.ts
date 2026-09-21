import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const videoCardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderCurve: 'continuous',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: STREAMBOX_COLORS.cardDark,
    borderColor: STREAMBOX_COLORS.cardBorderDark,
  },
  cardLight: {
    backgroundColor: STREAMBOX_COLORS.white,
    borderColor: STREAMBOX_COLORS.cardBorderLight,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22202E',
    overflow: 'hidden',
  },
  thumbnailImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    gap: 8,
  },
  fallbackText: {
    color: '#77738D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  duration: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(10, 9, 15, 0.82)',
    color: STREAMBOX_COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  content: {
    gap: 10,
    padding: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryMark: {
    width: 7,
    height: 7,
    borderCurve: 'continuous',
    borderRadius: 4,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  category: {
    color: STREAMBOX_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.35,
    lineHeight: 25,
  },
});
