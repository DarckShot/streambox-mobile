module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@shopify/flash-list|@react-native-async-storage/async-storage|@react-native-masked-view/masked-view)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
