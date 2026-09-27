import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RootRoute, TabRoute } from '../../navigation/routes';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { profileScreenStyles as styles } from './profileStyles';

type ProfileNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, TabRoute.Profile>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileMenuProps {
  compact: boolean;
  isDark: boolean;
  textColor: string;
}

interface ProfileLinkProps {
  compact: boolean;
  description: string;
  isDark: boolean;
  onPress: () => void;
  title: string;
}

const ProfileLink = ({
  compact,
  description,
  isDark,
  onPress,
  title,
}: ProfileLinkProps): ReactElement => (
  <Pressable
    accessibilityLabel={title}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.link,
      compact ? styles.linkCompact : null,
      pressed ? styles.linkPressed : null,
    ]}
  >
    <View style={styles.linkContent}>
      <Text style={[styles.linkTitle, isDark ? styles.textDark : styles.textLight]}>{title}</Text>
      {!compact ? (
        <Text
          style={[styles.linkDescription, isDark ? styles.secondaryDark : styles.secondaryLight]}
        >
          {description}
        </Text>
      ) : null}
    </View>
    <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.chevron}>
      ›
    </Text>
  </Pressable>
);

export const ProfileMenu = ({ compact, isDark, textColor }: ProfileMenuProps): ReactElement => {
  const navigation = useNavigation<ProfileNavigation>();

  return (
    <>
      <Text
        style={[
          styles.sectionTitle,
          compact ? styles.sectionTitleCompact : null,
          { color: textColor },
        ]}
      >
        Мои разделы
      </Text>
      <View style={[styles.links, isDark ? styles.surfaceDark : styles.surfaceLight]}>
        <ProfileLink
          compact={compact}
          description="Сохранённые видео"
          isDark={isDark}
          onPress={() => navigation.navigate(TabRoute.Favorites)}
          title="Избранное"
        />
        <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
        <ProfileLink
          compact={compact}
          description="Недавно просмотренные видео и прогресс"
          isDark={isDark}
          onPress={() => navigation.navigate(RootRoute.History)}
          title="История просмотра"
        />
        <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
        <ProfileLink
          compact={compact}
          description="Параметры приложения"
          isDark={isDark}
          onPress={() => navigation.navigate(RootRoute.Settings)}
          title="Настройки"
        />
      </View>
    </>
  );
};
