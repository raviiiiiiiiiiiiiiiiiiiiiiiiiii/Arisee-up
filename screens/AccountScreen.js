import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [userData, setUserData] = useState({ username: 'Hunter', email: '', level: 1, totalXP: 0, streak: 0 });
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(
    useCallback(() => {
      loadData();
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }, [])
  );

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) {
        const t = JSON.parse(tasks);
        setTaskStats({ total: t.length, completed: t.filter(x => x.done).length });
      }
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('LEAVE THE GUILD?', 'You will be returned to the gate.', [
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

  const currentRankLabel = () => {
    const l = userData.level || 1;
    if (l >= 80) return 'S RANK — SHADOW MONARCH';
    if (l >= 50) return 'A RANK — SHADOW KNIGHT';
    if (l >= 30) return 'B RANK — STEEL HUNTER';
    if (l >= 15) return 'C RANK — IRON HUNTER';
    if (l >= 5) return 'D RANK — NOVICE HUNTER';
    return 'E RANK — UNAWAKENED';
  };

  const MENU_ITEMS = [
    { icon: '🔔', label: 'Notifications', sub: 'Daily quest reminders', toggle: true },
    { icon: '🛡️', label: 'Privacy Policy', sub: '' },
    { icon: '📋', label: 'Terms of Service', sub: '' },
    { icon: '⭐', label: 'Rate the App', sub: 'Help us grow' },
    { icon: '💬', label: 'Support', sub: 'Contact the guild' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.glowBlob} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>⚔️</Text>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelBadgeText, { fontFamily: cinzelBold }]}>{userData.level || 1}</Text>
            </View>
          </View>

          <Text style={[styles.userName, { fontFamily: cinzelBold }]}>
            {(userData.username || 'Hunter').toUpperCase()}
          </Text>
          <Text style={styles.userEmail}>{userData.email || ''}</Text>

          <View style={styles.rankPill}>
            <Text style={[styles.rankPillText, { fontFamily: cinzel }]}>{currentRankLabel()}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { fontFamily: cinzelBold }]}>{taskStats.completed}</Text>
              <Text style={[styles.statLbl, { fontFamily: cinzel }]}>DONE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { fontFamily: cinzelBold }]}>{userData.totalXP || 0}</Text>
              <Text style={[styles.statLbl, { fontFamily: cinzel }]}>TOTAL XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { fontFamily: cinzelBold }]}>{userData.level || 1}</Text>
              <Text style={[styles.statLbl, { fontFamily: cinzel }]}>LEVEL</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu */}
        <Animated.View style={[styles.menuCard, { opacity: fadeAnim }]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={item.label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { fontFamily: cinzel }]}>{item.label}</Text>
                {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
              </View>
              {item.toggle ? (
                <Switch value={notifEnabled} onValueChange={setNotifEnabled}
                  trackColor={{ false: '#1A1F35', true: '#5B2FFF' }} thumbColor="#FFFFFF" />
              ) : (
                <Text style={styles.menuArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Text style={[styles.version, { fontFamily: cinzel }]}>ARISE v1.0.0 — SOLO LEVELING</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={[styles.logoutText, { fontFamily: cinzelBold }]}>⛔ LOG OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090F' },
  glowBlob: { position: 'absolute', top: -40, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#2A1580', opacity: 0.3 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  profileCard: { backgroundColor: '#0C0F1E', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#1A1F35', alignItems: 'center', marginBottom: 16 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#5B2FFF', padding: 4, shadowColor: '#5B2FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12 },
  avatar: { flex: 1, borderRadius: 50, backgroundColor: '#10142A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36 },
  levelBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#5B2FFF', borderRadius: 12, width: 26, height: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#07090F' },
  levelBadgeText: { color: '#FFFFFF', fontSize: 11 },
  userName: { color: '#FFFFFF', fontSize: 18, letterSpacing: 3, marginBottom: 4 },
  userEmail: { color: '#3D4060', fontSize: 13, marginBottom: 12 },
  rankPill: { backgroundColor: '#5B2FFF18', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#5B2FFF44', marginBottom: 20 },
  rankPillText: { color: '#A78BFF', fontSize: 10, letterSpacing: 1.5 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { color: '#FFFFFF', fontSize: 20 },
  statLbl: { color: '#3D4060', fontSize: 8, letterSpacing: 2, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: '#1A1F35', marginVertical: 4 },
  menuCard: { backgroundColor: '#0C0F1E', borderRadius: 16, borderWidth: 1, borderColor: '#1A1F35', marginBottom: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#10142A' },
  menuIcon: { fontSize: 20, width: 32 },
  menuInfo: { flex: 1, marginLeft: 12 },
  menuLabel: { color: '#FFFFFF', fontSize: 13 },
  menuSub: { color: '#3D4060', fontSize: 11, marginTop: 2 },
  menuArrow: { color: '#3D4060', fontSize: 22 },
  version: { color: '#1A1F35', fontSize: 9, textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
  logoutBtn: { backgroundColor: '#FF406018', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF406044' },
  logoutText: { color: '#FF4060', fontSize: 12, letterSpacing: 2 },
});
