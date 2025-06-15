import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SpotifyLogin from './screens/SpotifyLogin';
import CallbackPage from './screens/CallbackPage';
import { SpotifyProvider } from './SpotifyContext';
import OnePlayerScreen from './screens/OnePlayer'; // Make sure the file exists at this path
import TileScreen from './screens/TileScreen'; // Make sure the file exists at this path

const Stack = createStackNavigator();

const App = () => {
  return (
    <SpotifyProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SpotifyLogin">
          <Stack.Screen name="SpotifyLogin" component={SpotifyLogin} />
          <Stack.Screen name="Callback" component={CallbackPage} />
          <Stack.Screen name="OnePlayer" component={OnePlayerScreen} />
          <Stack.Screen name="Tile" component={TileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SpotifyProvider>
  );
};

export default App;
