import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBannerVisible } from '../network/OfflineBanner';

interface TabSafeAreaViewProps {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
}

export const TabSafeAreaView = ({ children, style }: TabSafeAreaViewProps): ReactElement => {
  const bannerVisible = useBannerVisible();
  return (
    <SafeAreaView edges={bannerVisible ? [] : ['top']} style={style}>
      {children}
    </SafeAreaView>
  );
};
