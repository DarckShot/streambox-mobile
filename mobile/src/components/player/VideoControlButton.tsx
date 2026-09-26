import { memo, type ReactElement, type ReactNode } from 'react';
import { Pressable } from 'react-native';

import { videoControlsStyles as styles } from './VideoControls.styles';

interface VideoControlButtonProps {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
}

const VideoControlButton = ({
  accessibilityLabel,
  children,
  disabled = false,
  onPress,
}: VideoControlButtonProps): ReactElement => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    hitSlop={8}
    onPress={onPress}
    style={({ pressed }) => [
      styles.iconButton,
      disabled ? styles.iconButtonDisabled : null,
      pressed ? styles.iconButtonPressed : null,
    ]}
  >
    {children}
  </Pressable>
);

export default memo(VideoControlButton);
