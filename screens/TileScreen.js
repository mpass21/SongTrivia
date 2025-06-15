import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSpotify } from '../SpotifyContext';
import { startRound, fetchRandomTrack } from '../helper';

const TileScreen = ({ navigation }) => {
  const [trackTitle, setTrackTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Click to begin!");
  const [showChoices, setShowChoices] = useState(false);
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const { accessToken } = useSpotify();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Callback')}>
          <Text style={{ color: '#1DB954', marginRight: 15, fontWeight: 'bold' }}>Menu</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const generateWrongTrackTitles = async (correctTitle) => {
    const wrongTitles = [];
    let attempts = 0;
    const maxAttempts = 10;

    while (wrongTitles.length < 3 && attempts < maxAttempts) {
      const randomTrack = await fetchRandomTrack(accessToken);
      if (randomTrack && randomTrack.name.toLowerCase() !== correctTitle.toLowerCase()) {
        const isDuplicate = wrongTitles.some(title =>
          title.toLowerCase() === randomTrack.name.toLowerCase()
        );
        if (!isDuplicate) {
          wrongTitles.push(randomTrack.name);
        }
      }
      attempts++;
    }

    const fallbackTitles = [
      "Unknown Track",
      "Mystery Song",
      "Random Tune"
    ];

    while (wrongTitles.length < 3) {
      wrongTitles.push(fallbackTitles[wrongTitles.length]);
    }

    return wrongTitles;
  };

  const handleStart = async () => {
    if (!accessToken) return setStatus("Login to Spotify first.");
    setHasStarted(true);
    setIsLoading(true);
    setSelectedChoice(null);
    setChoices([]);
    setShowChoices(false);

    await startRound({
      accessToken,
      setStatus,
      setTrackTitle: async (title) => {
        setTrackTitle(title);
        const wrongChoices = await generateWrongTrackTitles(title);
        const allChoices = [title, ...wrongChoices];
        const shuffledChoices = allChoices.sort(() => 0.5 - Math.random());
        setChoices(shuffledChoices);
      },
      setShowInput: setShowChoices,
      setCountdown,
    });

    setIsLoading(false);
  };

  const handleChoice = (chosenTitle) => {
    setSelectedChoice(chosenTitle);

    if (chosenTitle.trim().toLowerCase() === trackTitle.trim().toLowerCase()) {
      setStatus("Correct! 🎉");
      setScore(score + 1);
    } else {
      setStatus(`Wrong! It was "${trackTitle}"`);
    }

    setTimeout(() => {
      setShowChoices(false);
      handleStart();
    }, 2000);
  };

  const getButtonStyle = (choice) => {
    if (!selectedChoice) return styles.choiceButton;

    if (choice === trackTitle) {
      return [styles.choiceButton, styles.correctChoice];
    } else if (choice === selectedChoice) {
      return [styles.choiceButton, styles.wrongChoice];
    } else {
      return [styles.choiceButton, styles.disabledChoice];
    }
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

        {showChoices && choices.length > 0 && (
          <View style={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(choice)}
                onPress={() => handleChoice(choice)}
                disabled={selectedChoice !== null}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  choicesContainer: {
    width: '100%',
    marginTop: 20,
  },
  choiceButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  correctChoice: {
    backgroundColor: '#4CAF50',
  },
  wrongChoice: {
    backgroundColor: '#f44336',
  },
  disabledChoice: {
    backgroundColor: '#555',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
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

export default TileScreen;
