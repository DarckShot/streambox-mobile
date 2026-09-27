import Config from 'react-native-config';
import { Platform } from 'react-native';

const configuredUrl =
  Config.API_BASE_URL_DEVICE?.trim() ||
  (Platform.OS === 'android'
    ? Config.API_BASE_URL_ANDROID?.trim()
    : Config.API_BASE_URL_IOS?.trim());

export const API_BASE_URL = (
  configuredUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
).replace(/\/$/, '');
