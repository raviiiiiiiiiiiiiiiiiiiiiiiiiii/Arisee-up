import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useAppContext } from './context/AppContext';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useAppContext();
  const t = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.tabBg,
          borderTopColor: t.tabBorder,
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.textMuted,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Home')
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />;
          if (route.name === 'Progress')
            return <Ionicons name={focused ? 'trending-up' : 'trending-up-outline'} size={24} color={color} />;
          if (route.name === 'Settings')
            return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const { theme } = useAppContext();

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
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme.bg === '#0A0A12' ? 'light' : 'dark'} />
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

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
