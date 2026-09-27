import { BlurView } from '@react-native-community/blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '@react-navigation/native';
import { cloneElement, useCallback, useRef, useState, type ReactElement } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { getScrollEdges, type ScrollEdges } from './scrollEdges';

interface ScrollableProps {
  onContentSizeChange?: (width: number, height: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
}

interface ScrollEdgeBlurProps {
  children: ReactElement<ScrollableProps>;
  top?: boolean;
}

interface BlurEdgeProps {
  backgroundColor: string;
  dark: boolean;
  position: 'top' | 'bottom';
}

const GradientMask = ({ position }: Pick<BlurEdgeProps, 'position'>): ReactElement => (
  <Svg height="100%" width="100%">
    <Defs>
      <LinearGradient id="edgeFade" x1="0%" x2="0%" y1="0%" y2="100%">
        <Stop offset="0%" stopColor="white" stopOpacity={position === 'top' ? 1 : 0} />
        <Stop offset="100%" stopColor="white" stopOpacity={position === 'top' ? 0 : 1} />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#edgeFade)" />
  </Svg>
);

const BlurEdge = ({ backgroundColor, dark, position }: BlurEdgeProps): ReactElement => (
  <MaskedView
    androidRenderingMode="hardware"
    maskElement={<GradientMask position={position} />}
    pointerEvents="none"
    style={position === 'top' ? styles.top : styles.bottom}
  >
    <BlurView
      blurAmount={18}
      blurType={dark ? 'dark' : 'light'}
      reducedTransparencyFallbackColor={backgroundColor}
      style={StyleSheet.absoluteFill}
    />
  </MaskedView>
);

export const ScrollEdgeBlur = ({ children, top = true }: ScrollEdgeBlurProps): ReactElement => {
  const { colors, dark } = useTheme();
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const offset = useRef(0);
  const [edges, setEdges] = useState<ScrollEdges>({ top: false, bottom: false });

  const updateEdges = useCallback((): void => {
    const next = getScrollEdges(offset.current, viewportHeight.current, contentHeight.current);
    setEdges((previous) =>
      previous.top === next.top && previous.bottom === next.bottom ? previous : next,
    );
  }, []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent): void => {
      viewportHeight.current = event.nativeEvent.layout.height;
      updateEdges();
      children.props.onLayout?.(event);
    },
    [children, updateEdges],
  );

  const onContentSizeChange = useCallback(
    (width: number, height: number): void => {
      contentHeight.current = height;
      updateEdges();
      children.props.onContentSizeChange?.(width, height);
    },
    [children, updateEdges],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      offset.current = event.nativeEvent.contentOffset.y;
      if (event.nativeEvent.layoutMeasurement.height > 0) {
        viewportHeight.current = event.nativeEvent.layoutMeasurement.height;
      }
      if (event.nativeEvent.contentSize.height > 0) {
        contentHeight.current = event.nativeEvent.contentSize.height;
      }
      updateEdges();
      children.props.onScroll?.(event);
    },
    [children, updateEdges],
  );

  return (
    <View style={styles.container}>
      {cloneElement(children, { onContentSizeChange, onLayout, onScroll, scrollEventThrottle: 16 })}
      {top && edges.top ? (
        <BlurEdge backgroundColor={colors.background} dark={dark} position="top" />
      ) : null}
      {edges.bottom ? (
        <BlurEdge backgroundColor={colors.background} dark={dark} position="bottom" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 40 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 48 },
});
