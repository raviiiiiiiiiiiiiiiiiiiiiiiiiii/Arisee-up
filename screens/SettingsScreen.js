import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userData, setUserData] = useState({ username: 'Hunter', email: '' });

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  useFocusEffect(useCallback(() => {
    (async () => {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
    })();
  }, []));

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to leave the guild?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('user_loggedin');
        navigation.replace('Auth');
      }},
    ]);
  };

  const TOGGLES = [
    { label: 'Notifications', icon: '🔔', value: notifications, onToggle: setNotifications },
    { label: 'Sound Effects', icon: '🔊', value: soundEffects, onToggle: setSoundEffects },
    { label: 'Vibration', icon: '📳', value: vibration, onToggle: setVibration },
    { label: 'Dark Mode', icon: '🌙', value: darkMode, onToggle: setDarkMode },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { fontFamily: cinzelBold }]}>ARISE</Text>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* Toggles Card */}
        <View style={styles.card}>
          {TOGGLES.map((item, i) => (
            <View key={item.label} style={[styles.settingRow, i < TOGGLES.length - 1 && styles.settingBorder]}>
              <View style={styles.settingIconWrap}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#1E1E30', true: '#7B4FFF' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#1E1E30"
              />
            </View>
          ))}
        </View>

        {/* Account + Logout Card */}
        <View style={styles.card}>
          <TouchableOpacity style={[styles.settingRow, styles.settingBorder]}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Account</Text>
              <Text style={styles.settingSub}>{userData.username} · {userData.email}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={[styles.settingIconWrap, styles.logoutIconWrap]}>
              <Text style={styles.settingIcon}>🚪</Text>
            </View>
            <Text style={styles.logoutLabel}>Logout</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { fontFamily: cinzel }]}>ARISE v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12' },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 14, color: '#A78BFF', letterSpacing: 6, marginBottom: 8 },
  pageTitle: { fontSize: 34, color: '#FFFFFF', fontWeight: '300' },

  card: { backgroundColor: '#12121E', borderRadius: 16, borderWidth: 1, borderColor: '#1E1E30', marginBottom: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: '#1E1E30' },
  settingIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1E1E30', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  logoutIconWrap: { backgroundColor: '#FF404022' },
  settingIcon: { fontSize: 18 },
  settingLabel: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  settingSub: { color: '#555577', fontSize: 12, marginTop: 2 },
  settingArrow: { color: '#555577', fontSize: 20 },
  logoutLabel: { flex: 1, color: '#FF4040', fontSize: 15 },

  version: { color: '#2A2A3A', fontSize: 10, textAlign: 'center', letterSpacing: 2 },
});
