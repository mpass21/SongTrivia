import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = ({ navigation, route, onSave }) => {
  const { currentUnits } = route.params;


  const [distanceUnitOpen, setDistanceUnitOpen] = useState(false);
  const [bearingUnitOpen, setBearingUnitOpen] = useState(false);
  
  const [distanceUnit, setDistanceUnit] = useState(currentUnits.distance);
  const [bearingUnit, setBearingUnit] = useState(currentUnits.bearing);
  
  const [distanceItems, setDistanceItems] = useState([
    { label: 'Kilometers', value: 'km' },
    { label: 'Miles', value: 'mi' },
  ]);
  
  const [bearingItems, setBearingItems] = useState([
    { label: 'Degrees', value: 'degrees' },
    { label: 'Mils', value: 'mils' },
  ]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Text style={styles.headerText}>Cancel</Text>
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              onSave({ distance: distanceUnit, bearing: bearingUnit });
              navigation.goBack();
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerText}>Save</Text>
          </TouchableOpacity>
        ),
      });
    }, [navigation, distanceUnit, bearingUnit, onSave])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Distance Units</Text>
      <DropDownPicker
        open={distanceUnitOpen}
        value={distanceUnit}
        items={distanceItems}
        setOpen={setDistanceUnitOpen}
        setValue={setDistanceUnit}
        setItems={setDistanceItems}
        containerStyle={styles.dropdown}
      />

      <Text style={styles.label}>Bearing Units</Text>
      <DropDownPicker
        open={bearingUnitOpen}
        value={bearingUnit}
        items={bearingItems}
        setOpen={setBearingUnitOpen}
        setValue={setBearingUnit}
        setItems={setBearingItems}
        containerStyle={styles.dropdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
  },
  dropdown: {
    marginTop: 30,
    marginBottom: 30,
    zIndex: 1000,
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 16,
    color: 'blue',
  },
});

export default SettingsScreen;