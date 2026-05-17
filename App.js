import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import LevelScreen from './screens/LevelScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = { Home: '⚔️', Level: '⭐', Account: '👤' };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {icons[name]}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#070B14',
          borderTopColor: '#1A2340',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#3DA9FC',
        tabBarInactiveTintColor: '#3D4F6E',
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Level"
        component={LevelScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Level" focused={focused} /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Account" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
