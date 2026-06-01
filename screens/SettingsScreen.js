import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const {
    darkMode, theme,
    notificationsEnabled, hapticsEnabled,
    toggleDarkMode, toggleNotifications, toggleHaptics,
  } = useAppContext();

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const t = theme;
  const iconBg = darkMode ? '#1E1E35' : '#EEEEFF';

  const TOGGLES = [
    {
      label: 'Notifications',
      sub: 'Daily quest reminders',
      icon: <Ionicons name="notifications-outline" size={20} color={t.accentLight} />,
      value: notificationsEnabled,
      onToggle: toggleNotifications,
    },
    {
      label: 'Haptic Feedback',
      sub: 'Vibration on interactions',
      icon: <MaterialCommunityIcons name="vibrate" size={20} color={t.accentLight} />,
      value: hapticsEnabled,
      onToggle: toggleHaptics,
    },
    {
      label: 'Dark Mode',
      sub: darkMode ? 'Currently dark' : 'Currently light',
      icon: <Ionicons name={darkMode ? 'moon' : 'sunny-outline'} size={20} color={t.accentLight} />,
      value: darkMode,
      onToggle: toggleDarkMode,
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
            <View
              key={item.label}
              style={[
                styles.row,
                i < TOGGLES.length - 1 && [styles.rowBorder, { borderBottomColor: t.cardBorder }],
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                {item.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: t.text }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: t.textMuted }]}>{item.sub}</Text>
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
  header: { alignItems: 'center', marginBottom: 64 },
  appName: { fontSize: 14, letterSpacing: 6, marginBottom: 8 },
  pageTitle: { fontSize: 34, fontWeight: '300' },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rowLabel: { fontSize: 15 },
  rowSub: { fontSize: 11, marginTop: 2 },
  version: { fontSize: 9, textAlign: 'center', letterSpacing: 2, opacity: 0.5 },
});
