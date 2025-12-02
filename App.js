import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import MaskingOptionsScreen from './screens/MaskingOptionsScreen';
import DetectionResultsScreen from './screens/DetectionResultsScreen';
import SuccessScreen from './screens/SuccessScreen';
import FileContentTestScreen from './screens/FileContentTestScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MaskingOptions" component={MaskingOptionsScreen} />
        <Stack.Screen name="FileContentTest" component={FileContentTestScreen} />
        <Stack.Screen name="DetectionResults" component={DetectionResultsScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
