import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const basicVideoPlayerStyles = StyleSheet.create({
  frame: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#09090D',
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.7,
  },
  posterShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 6, 12, 0.38)',
  },
  centerState: {
    zIndex: 1,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
  stateLabel: {
    color: STREAMBOX_COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  controlButton: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: 24,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  controlButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.96 }],
  },
  errorIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
  },
  errorTitle: {
    color: STREAMBOX_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorDescription: {
    maxWidth: 320,
    color: '#BBB8CA',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  errorButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    paddingHorizontal: 18,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  errorButtonText: {
    color: STREAMBOX_COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
