import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/navigation/types';
import { AppStateProvider } from './src/state/AppState';

import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LogInScreen from './src/screens/LogInScreen';
import FindQuestScreen from './src/screens/FindQuestScreen';
import FinishedQuestsScreen from './src/screens/FinishedQuestsScreen';
import FinishedQuestDetailScreen from './src/screens/FinishedQuestDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BadgesScreen from './src/screens/BadgesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F7F5F1' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="LogIn" component={LogInScreen} />
            <Stack.Screen
              name="FindQuest"
              component={FindQuestScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen name="FinishedQuests" component={FinishedQuestsScreen} />
            <Stack.Screen
              name="FinishedQuestDetail"
              component={FinishedQuestDetailScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
