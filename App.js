import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';

import Form from './screens/Form';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [units, setUnits] = useState({
    distance: 'km',
    bearing: 'degrees',
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="form"
          options={({ navigation }) => ({
            title: 'Calculator',
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('settings', {
                    currentUnits: units,
                  })
                }
                style={{ marginRight: 15 }}
              >
                <Feather name="settings" size={24} color="black" />
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => <Form {...props} units={units} onUnitsChange={setUnits} />}
        </Stack.Screen>

        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        >
          {(props) => <SettingsScreen {...props} onSave={setUnits} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
