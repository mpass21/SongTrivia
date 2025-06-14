import { Keyboard, SafeAreaView, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { computeDistance, computeBearing, round } from '../HelperFunctions';
import axios from 'axios';
import API_KEY from '../Key';

const ICONS = {
  img01d: require('../assets/img01d.png'),
  img01n: require('../assets/img01n.png'),
  img02d: require('../assets/img02d.png'),
  img02n: require('../assets/img02n.png'),
  img03d: require('../assets/img03d.png'),
  img03n: require('../assets/img03n.png'),
  img04d: require('../assets/img04d.png'),
  img04n: require('../assets/img04n.png'),
  img09d: require('../assets/img09d.png'),
  img09n: require('../assets/img09n.png'),
  img10d: require('../assets/img10d.png'),
  img10n: require('../assets/img10n.png'),
  img13d: require('../assets/img13d.png'),
  img13n: require('../assets/img13n.png'),
  img50d: require('../assets/img13d.png'),
  img50n: require('../assets/img13n.png'),
};

const Form = ({ units: propUnits }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const [units, setUnits] = useState(propUnits || {
    distance: 'km',
    bearing: 'degrees',
  });

  const [formData, setFormData] = useState({
    latitude1: '',
    longitude1: '',
    latitude2: '',
    longitude2: '',
    distance: '',
    bearing: '',
  });

  const [sourceWeather, setSourceWeather] = useState(null);
  const [destWeather, setDestWeather] = useState(null);

  useEffect(() => {
    if (propUnits) {
      setUnits(propUnits);
    }
  }, [propUnits]);

  useEffect(() => {
    if (formData.latitude1 && formData.longitude1 && formData.latitude2 && formData.longitude2) {
      handleSubmit();
    }
  }, [units]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      const data = res.data;
      return {
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } catch (err) {
      console.error("Weather fetch failed:", err);
      return null;
    }
  };

  const handleSubmit = () => {
    const { latitude1, longitude1, latitude2, longitude2 } = formData;

    if (!latitude1 || !longitude1 || !latitude2 || !longitude2) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const lat1 = parseFloat(latitude1);
    const lon1 = parseFloat(longitude1);
    const lat2 = parseFloat(latitude2);
    const lon2 = parseFloat(longitude2);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      Alert.alert('Please enter valid numeric coordinates');
      return;
    }

    let distance = computeDistance(lat1, lon1, lat2, lon2);
    if (units.distance === 'mi') {
      distance *= 0.621371;
    }

    let bearing = computeBearing(lat1, lon1, lat2, lon2);
    if (units.bearing === 'mils') {
      bearing = bearing * 17.7777778;
    }

    setFormData((prev) => ({
      ...prev,
      distance: `${round(distance, 3)} ${units.distance}`,
      bearing: `${round(bearing, 3)} ${units.bearing}`,
    }));

    fetchWeather(lat1, lon1).then(setSourceWeather);
    fetchWeather(lat2, lon2).then(setDestWeather);
  };

  const handleClear = () => {
    setFormData({
      latitude1: '',
      longitude1: '',
      latitude2: '',
      longitude2: '',
      distance: '',
      bearing: '',
    });
    setSourceWeather(null);
    setDestWeather(null);
  };

  const renderWeather = (weather, label) => {
    if (!weather?.icon) return null;
    return (
      <View style={styles.weatherBox}>
        <Image
          style={{ width: 60, height: 60, marginRight: 10 }}
          source={ICONS['img' + weather.icon]}
        />
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{label}</Text>
          <Text>{round(weather.temp, 0)}°F</Text>
          <Text>{weather.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter Coordinates</Text>

          <TextInput
            style={styles.input}
            placeholder="Latitude for point 1"
            value={formData.latitude1}
            onChangeText={(text) => handleChange('latitude1', text)}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude for point 1"
            value={formData.longitude1}
            onChangeText={(text) => handleChange('longitude1', text)}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude for point 2"
            value={formData.latitude2}
            onChangeText={(text) => handleChange('latitude2', text)}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude for point 2"
            value={formData.longitude2}
            onChangeText={(text) => handleChange('longitude2', text)}
            keyboardType="numbers-and-punctuation"
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>

          {formData.distance !== '' && (
            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Distance:</Text>
                <Text style={styles.resultValue}>{formData.distance}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Bearing:</Text>
                <Text style={styles.resultValue}>{formData.bearing}</Text>
              </View>
            </View>
          )}

          {sourceWeather && destWeather && (
            <View style={styles.resultContainer}>
              <Text style={{ fontWeight: '600', marginBottom: 5 }}>Weather Info</Text>
              {renderWeather(sourceWeather, 'Point 1')}
              {renderWeather(destWeather, 'Point 2')}
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Form;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#0066cc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  resultLabel: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
    fontSize: 16,
  },
  resultValue: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 16,
  },
weatherBox: {
  backgroundColor: '#80c7ff',  // Darker blue shade
  padding: 12,
  borderRadius: 8,
  marginTop: 10,
  flexDirection: 'row',
  alignItems: 'center',
},
});
