import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainScreen, AddTransactionModal } from '@/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#FFFFFF',
    border: '#1C1C1E',
    primary: '#FFFFFF',
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={customDarkTheme}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'none',
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionModal}
          options={{
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
