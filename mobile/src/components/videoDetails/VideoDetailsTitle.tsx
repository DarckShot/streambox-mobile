import { useCallback, useState, type ReactElement } from 'react';
import {
  Pressable,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';

import { videoDetailsScreenStyles as styles } from '../../screens/VideoDetailsScreen.styles';

interface VideoDetailsTitleProps {
  title: string;
  isCompact: boolean;
  textColor: string;
}

export const VideoDetailsTitle = ({
  title,
  isCompact,
  textColor,
}: VideoDetailsTitleProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const lineLimit = isCompact ? 1 : 2;

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>): void => {
      setOverflowing(event.nativeEvent.lines.length > lineLimit);
    },
    [lineLimit],
  );

  return (
    <View style={styles.titleBlock}>
      <Text
        accessible={false}
        importantForAccessibility="no"
        onTextLayout={handleTextLayout}
        style={[styles.title, isCompact ? styles.titleCompact : null, styles.titleMeasure]}
      >
        {title}
      </Text>
      <Text
        ellipsizeMode="tail"
        numberOfLines={expanded ? undefined : lineLimit}
        style={[styles.title, isCompact ? styles.titleCompact : null, { color: textColor }]}
      >
        {title}
      </Text>
      {overflowing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          style={styles.titleToggle}
        >
          <Text style={styles.titleToggleText}>{expanded ? 'Свернуть' : 'Показать полностью'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
