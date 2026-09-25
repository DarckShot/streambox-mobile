import { StyleSheet } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

export const videoControlsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 3,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(7, 6, 12, 0.62)',
  },
  containerFullscreen: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: 'rgba(7, 6, 12, 0.74)',
  },
  timeline: {
    height: 18,
    justifyContent: 'center',
  },
  timelineTrack: {
    height: 3,
    borderCurve: 'continuous',
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  timelineProgress: {
    height: '100%',
    borderCurve: 'continuous',
    borderRadius: 2,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  timelineThumb: {
    position: 'absolute',
    top: -4,
    right: -5,
    width: 11,
    height: 11,
    borderWidth: 2,
    borderColor: STREAMBOX_COLORS.white,
    borderRadius: 6,
    backgroundColor: STREAMBOX_COLORS.accent,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  time: {
    flex: 1,
    color: STREAMBOX_COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
