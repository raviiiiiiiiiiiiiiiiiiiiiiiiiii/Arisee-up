import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏠' },
  Progress: { active: '📈', inactive: '📈' },
  Settings: { active: '⚙️', inactive: '⚙️' },
};

function MainTabs() {
  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F1C',
          borderTopColor: '#1E1E30',
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#A78BFF',
        tabBarInactiveTintColor: '#444466',
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>
            {TAB_ICONS[route.name]?.active}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem('onboarding_done');
        const loggedIn = await AsyncStorage.getItem('user_loggedin');
        if (!done) setInitialRoute('Onboarding');
        else if (!loggedIn) setInitialRoute('Auth');
        else setInitialRoute('Main');
      } catch {
        setInitialRoute('Onboarding');
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A12', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#A78BFF" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
