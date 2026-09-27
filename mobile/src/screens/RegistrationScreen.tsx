import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { AuthForm } from '../components/auth/AuthForm';
import type { RootStackParamList } from '../navigation/types';

export const RegistrationScreen = (): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <AuthForm mode="register" onAlternate={() => navigation.goBack()} />;
};
