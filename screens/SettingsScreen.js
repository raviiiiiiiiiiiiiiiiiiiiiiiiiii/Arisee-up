import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

  useFocusEffect(useCallback(() => {
    (async () => {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
      // Load saved settings
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const s = JSON.parse(settings);
        setNotifications(s.notifications ?? true);
        setSoundEffects(s.soundEffects ?? true);
        setVibration(s.vibration ?? false);
        setDarkMode(s.darkMode ?? true);
      }
    })();
  }, []));

  const saveSetting = async (key, value) => {
    const settings = await AsyncStorage.getItem('app_settings');
    const s = settings ? JSON.parse(settings) : {};
    s[key] = value;
    await AsyncStorage.setItem('app_settings', JSON.stringify(s));
  };

  const handleToggle = (key, setter) => async (val) => {
    setter(val);
    await saveSetting(key, val);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to leave the guild?', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user_loggedin');
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const TOGGLES = [
    {
      label: 'Notifications',
      icon: <Ionicons name="notifications-outline" size={20} color="#A78BFF" />,
      value: notifications,
      onToggle: handleToggle('notifications', setNotifications),
    },
    {
      label: 'Sound Effects',
      icon: <Ionicons name="volume-medium-outline" size={20} color="#A78BFF" />,
      value: soundEffects,
      onToggle: handleToggle('soundEffects', setSoundEffects),
    },
    {
      label: 'Vibration',
      icon: <MaterialIcons name="vibration" size={20} color="#A78BFF" />,
      value: vibration,
      onToggle: handleToggle('vibration', setVibration),
    },
    {
      label: 'Dark Mode',
      icon: <Ionicons name="moon-outline" size={20} color="#A78BFF" />,
      value: darkMode,
      onToggle: handleToggle('darkMode', setDarkMode),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { fontFamily: cinzelBold }]}>ARISE</Text>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {/* Toggles */}
        <View style={styles.card}>
          {TOGGLES.map((item, i) => (
            <View key={item.label}
              style={[styles.row, i < TOGGLES.length - 1 && styles.rowBorder]}>
              <View style={styles.iconWrap}>{item.icon}</View>
              <Text style={styles.rowLabel}>{item.label}</Text>
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

        {/* Account + Logout */}
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.rowBorder]}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-outline" size={20} color="#A78BFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Account</Text>
              <Text style={styles.rowSub}>{userData.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#555577" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={[styles.iconWrap, styles.logoutIconWrap]}>
              <MaterialIcons name="logout" size={20} color="#FF4040" />
            </View>
            <Text style={styles.logoutLabel}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color="#555577" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { fontFamily: fontsLoaded ? 'CinzelDecorative_400Regular' : 'System' }]}>
          ARISE v1.0.0
        </Text>

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
  card: {
    backgroundColor: '#12121E', borderRadius: 16,
    borderWidth: 1, borderColor: '#1E1E30',
    marginBottom: 16, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#1E1E30' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1E1E35',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  logoutIconWrap: { backgroundColor: '#FF404018' },
  rowLabel: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  rowSub: { color: '#555577', fontSize: 12, marginTop: 2 },
  logoutLabel: { flex: 1, color: '#FF4040', fontSize: 15 },
  version: { color: '#2A2A3A', fontSize: 9, textAlign: 'center', letterSpacing: 2 },
});
