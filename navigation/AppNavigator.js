import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PhoneNumberAuth from '../PhoneNumberAuth';
import Home from '../Home';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PhoneNumberAuth">
        <Stack.Screen name="PhoneNumberAuth" component={PhoneNumberAuth} options={{ title: 'Login' }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Home' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
