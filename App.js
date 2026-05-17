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
import LevelScreen from './screens/LevelScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = { Home: '⚔️', Level: '⭐', Account: '👤' };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.35 }}>{icons[name]}</Text>
  );
}

function MainTabs() {
  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07090F',
          borderTopColor: '#1A1F35',
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#A78BFF',
        tabBarInactiveTintColor: '#3D4060',
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: fontsLoaded ? 'CinzelDecorative_400Regular' : 'System',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }} />
      <Tab.Screen name="Level" component={LevelScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Level" focused={focused} /> }} />
      <Tab.Screen name="Account" component={AccountScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Account" focused={focused} /> }} />
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
      <View style={{ flex: 1, backgroundColor: '#07090F', justifyContent: 'center', alignItems: 'center' }}>
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
