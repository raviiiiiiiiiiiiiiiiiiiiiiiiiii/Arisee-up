import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const {
    darkMode, theme,
    soundEnabled, vibrationEnabled, notificationsEnabled,
    toggleDarkMode, toggleSound, toggleVibration, toggleNotifications,
    triggerHaptic, playSound,
  } = useAppContext();

  const [userData, setUserData] = useState({ username: 'Hunter', email: '' });

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const t = theme;

  useFocusEffect(useCallback(() => {
    (async () => {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
    })();
  }, []));

  const handleLogout = () => {
    triggerHaptic('medium');
    Alert.alert('Log Out', 'Are you sure you want to leave the guild?', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          // Clear all user-specific data on logout
          await AsyncStorage.multiRemove([
            'user_loggedin',
            'user_data',
            'tasks',
            'last_task_day',
          ]);
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const TOGGLES = [
    {
      label: 'Notifications',
      sub: 'Daily quest reminders',
      icon: <Ionicons name="notifications-outline" size={20} color={t.accentLight} />,
      value: notificationsEnabled,
      onToggle: async (val) => { playSound('tap'); await toggleNotifications(val); },
    },
    {
      label: 'Sound Effects',
      sub: 'In-app sounds',
      icon: <Ionicons name="volume-medium-outline" size={20} color={t.accentLight} />,
      value: soundEnabled,
      onToggle: async (val) => { await toggleSound(val); },
    },
    {
      label: 'Vibration',
      sub: 'Haptic feedback',
      icon: <MaterialIcons name="vibration" size={20} color={t.accentLight} />,
      value: vibrationEnabled,
      onToggle: async (val) => { playSound('tap'); await toggleVibration(val); },
    },
    {
      label: 'Dark Mode',
      sub: darkMode ? 'Currently dark' : 'Currently light',
      icon: <Ionicons name={darkMode ? 'moon' : 'sunny-outline'} size={20} color={t.accentLight} />,
      value: darkMode,
      onToggle: async (val) => { playSound('tap'); await toggleDarkMode(val); },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.appName, { fontFamily: cinzelBold, color: t.accentLight }]}>ARISE</Text>
          <Text style={[styles.pageTitle, { color: t.text }]}>Settings</Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {TOGGLES.map((item, i) => (
            <View key={item.label}
              style={[styles.row, i < TOGGLES.length - 1 && [styles.rowBorder, { borderBottomColor: t.cardBorder }]]}>
              <View style={[styles.iconWrap, { backgroundColor: t.dark ? '#1E1E35' : '#EEEEFF' }]}>
                {item.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: t.text }]}>{item.label}</Text>
                {item.sub && <Text style={[styles.rowSub, { color: t.textMuted }]}>{item.sub}</Text>}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: t.cardBorder, true: t.accent }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={t.cardBorder}
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder, { borderBottomColor: t.cardBorder }]}
            onPress={() => triggerHaptic('light')}
          >
            <View style={[styles.iconWrap, { backgroundColor: t.dark ? '#1E1E35' : '#EEEEFF' }]}>
              <Ionicons name="person-outline" size={20} color={t.accentLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: t.text }]}>Account</Text>
              <Text style={[styles.rowSub, { color: t.textMuted }]}>{userData.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={[styles.iconWrap, { backgroundColor: '#FF404018' }]}>
              <MaterialIcons name="logout" size={20} color="#FF4040" />
            </View>
            <Text style={[styles.rowLabel, { color: '#FF4040', flex: 1 }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { fontFamily: cinzel, color: t.textMuted }]}>
          ARISE v1.0.0 — SOLO LEVELING
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 14, letterSpacing: 6, marginBottom: 8 },
  pageTitle: { fontSize: 34, fontWeight: '300' },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rowLabel: { fontSize: 15 },
  rowSub: { fontSize: 11, marginTop: 2 },
  version: { fontSize: 9, textAlign: 'center', letterSpacing: 2, opacity: 0.5 },
});
