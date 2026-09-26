import { StyleSheet } from 'react-native';

export const rutubeVideoPlayerStyles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenFrame: {
    flex: 1,
    aspectRatio: undefined,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsSurface: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
