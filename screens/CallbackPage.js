import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CallbackPage = ({ navigation }) => {
  const handleOnePlayer = () => {
    navigation.navigate('OnePlayer');
  };

  const handleTwoPlayer = () => {
    navigation.navigate('Tile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Successfully Logged in to Spotify!</Text>

      <TouchableOpacity style={styles.button} onPress={handleOnePlayer}>
        <Text style={styles.buttonText}>Play Standard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleTwoPlayer}>
        <Text style={styles.buttonText}>Tile Game Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#1DB954',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CallbackPage;
