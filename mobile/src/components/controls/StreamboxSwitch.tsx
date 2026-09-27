import { useEffect, useRef, type ReactElement } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { STREAMBOX_COLORS } from '../../constants/theme';

interface StreamboxSwitchProps {
  accessibilityLabel: string;
  disabled?: boolean;
  isDark: boolean;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

export const StreamboxSwitch = ({
  accessibilityLabel,
  disabled = false,
  isDark,
  onValueChange,
  value,
}: StreamboxSwitchProps): ReactElement => {
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [position, value]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.track,
        value ? styles.trackActive : isDark ? styles.trackDark : styles.trackLight,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          value ? styles.thumbActive : isDark ? styles.thumbDark : styles.thumbLight,
          {
            transform: [
              { translateX: position.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
            ],
          },
        ]}
      >
        <View
          style={[styles.thumbMark, value ? styles.thumbMarkActive : styles.thumbMarkInactive]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 58,
    height: 36,
    borderRadius: 18,
    padding: 4,
    justifyContent: 'center',
    borderWidth: 1,
  },
  trackActive: { backgroundColor: STREAMBOX_COLORS.accent, borderColor: STREAMBOX_COLORS.accent },
  trackDark: { backgroundColor: '#343142', borderColor: '#4A465C' },
  trackLight: { backgroundColor: '#EAE7F3', borderColor: '#D9D4E6' },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D143B',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbActive: { backgroundColor: STREAMBOX_COLORS.white },
  thumbDark: { backgroundColor: '#C4BED5' },
  thumbLight: { backgroundColor: STREAMBOX_COLORS.white },
  thumbMark: { width: 6, height: 6, borderRadius: 3 },
  thumbMarkActive: { backgroundColor: STREAMBOX_COLORS.accent },
  thumbMarkInactive: { backgroundColor: '#9A92AA' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
