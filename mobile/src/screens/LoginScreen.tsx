import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { AuthForm } from '../components/auth/AuthForm';
import { RootRoute } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

export const LoginScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <AuthForm mode="login" onAlternate={() => navigation.navigate(RootRoute.Register)} />;
};
