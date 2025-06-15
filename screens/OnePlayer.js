import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSpotify } from '../SpotifyContext';
import { startRound } from '../helper'; // uses named exports

const OnePlayerScreen = ({ navigation }) => {
  const [trackTitle, setTrackTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Click to begin!");
  const [guess, setGuess] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const { accessToken } = useSpotify();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Callback')}>
          <Text style={{ color: '#1DB954', marginRight: 15, fontWeight: 'bold' }}>Menu</Text>
        </TouchableOpacity>
      ),
      headerLeft: () => null, // removes the back arrow
    });
  }, [navigation]);

  const handleStart = async () => {
    if (!accessToken) return setStatus("Login to Spotify first.");
    setHasStarted(true);
    setIsLoading(true);
    await startRound({
      accessToken,
      setStatus,
      setTrackTitle,
      setShowInput,
      setCountdown,
    });
    setIsLoading(false);
  };

  const handleGuess = () => {
    if (guess.trim().toLowerCase() === trackTitle.trim().toLowerCase()) {
      setStatus("Correct! 🎉");
      setScore(score + 1);
    } else {
      setStatus(`Wrong! It was "${trackTitle}"`);
    }
    setGuess('');
    handleStart(); // Start next round
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Guess the Spotify Track</Text>
        <Text style={styles.score}>Score: {score}</Text>

        {!hasStarted && (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Round</Text>
          </TouchableOpacity>
        )}

        {isLoading && <ActivityIndicator size="large" color="#1DB954" />}
        {countdown > 0 && !isLoading && hasStarted && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}

        {showInput && (
          <>
            <TextInput
              value={guess}
              onChangeText={setGuess}
              placeholder="Your guess"
              style={styles.input}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleGuess}>
              <Text style={styles.buttonText}>Submit Guess</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.status}>{status}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#1DB954',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '80%',
    marginTop: 20,
  },
  countdown: {
    fontSize: 40,
    color: '#1DB954',
    marginBottom: 20,
  },
  status: {
    color: '#ccc',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default OnePlayerScreen;
