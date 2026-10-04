import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import {
  HomeScreen,
  AddTransactionModal,
  MetricsScreen,
  SubscriptionsScreen,
  GoalsScreen,
} from '@/screens';

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
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'simple_push',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
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
        <Stack.Screen
          name="Subscriptions"
          component={SubscriptionsScreen}
          options={{
            headerShown: false,
            animation: 'simple_push',
          }}
        />
        <Stack.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            headerShown: false,
            animation: 'simple_push',
          }}
        />
        <Stack.Screen
          name="Metrics"
          component={MetricsScreen}
          options={{
            headerShown: false,
            animation: 'simple_push',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
