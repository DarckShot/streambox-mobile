import { StatusBar, StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[styles.root, isDarkMode ? styles.rootDark : styles.rootLight]}
      >
        <Text style={[styles.mainText, isDarkMode ? styles.textDark : styles.textLight]}>
          Welcome to the Streambox Mobile App
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: '#FFFFFF',
  },
  rootDark: {
    backgroundColor: '#000000',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
  mainText: {
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
