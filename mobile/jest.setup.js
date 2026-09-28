/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);
jest.mock('react-native-config', () => ({
  API_BASE_URL_IOS: 'http://localhost:3000',
  API_BASE_URL_ANDROID: 'http://10.0.2.2:3000',
  API_BASE_URL_DEVICE: '',
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => false),
  setGenericPassword: jest.fn(async () => ({
    service: 'streambox.refresh-token',
    storage: 'keychain',
  })),
  resetGenericPassword: jest.fn(async () => true),
}));
