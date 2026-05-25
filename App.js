import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

import { AppProvider, useAppContext } from './context/AppContext';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import OfflineScreen from './screens/OfflineScreen';

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
  const [isOnline, setIsOnline] = useState(true);
  const [checkingNetwork, setCheckingNetwork] = useState(true);
  const { theme } = useAppContext();

  const checkNetwork = useCallback(async () => {
    setCheckingNetwork(true);
    try {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    } catch {
      setIsOnline(false);
    }
    setCheckingNetwork(false);
  }, []);

  useEffect(() => {
    checkNetwork();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') checkNetwork();
    });
    return () => { unsubscribe(); appStateSub.remove(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem('onboarding_done');
        // No auth — go straight to Main after onboarding
        setInitialRoute(done ? 'Main' : 'Onboarding');
      } catch {
        setInitialRoute('Onboarding');
      }
    })();
  }, []);

  if (checkingNetwork || !initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07090F', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#A78BFF" size="large" />
      </View>
    );
  }

  if (!isOnline) {
    return <OfflineScreen onRetry={checkNetwork} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
