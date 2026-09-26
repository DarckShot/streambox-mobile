module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@shopify/flash-list|@react-native-async-storage/async-storage)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
