import { useTheme } from '@react-navigation/native';
import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

import { placeholderScreenStyles as styles } from './PlaceholderScreen.styles';

type PlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  detail?: string;
};

export function PlaceholderScreen({
  eyebrow,
  title,
  description,
  detail,
}: PlaceholderScreenProps): ReactElement {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.glow, dark ? styles.glowDark : styles.glowLight]} />
      <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.brandMark} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, dark ? styles.descriptionDark : styles.descriptionLight]}>
          {description}
        </Text>
        {detail ? (
          <Text
            style={[
              styles.detail,
              { color: colors.text },
              dark ? styles.detailDark : styles.detailLight,
            ]}
          >
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
