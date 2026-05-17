import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert, Switch,
} from 'react-native';

const MENU_ITEMS = [
  { icon: '🏆', label: 'Achievements', sub: '12 unlocked' },
  { icon: '📊', label: 'Quest History', sub: 'View all completed quests' },
  { icon: '🔔', label: 'Notifications', sub: 'Daily quest reminders', toggle: true },
  { icon: '🛡️', label: 'Privacy Policy', sub: '' },
  { icon: '📋', label: 'Terms of Service', sub: '' },
  { icon: '⭐', label: 'Rate the App', sub: 'Help us grow' },
  { icon: '💬', label: 'Support', sub: 'Contact the guild' },
];

export default function AccountScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [notifEnabled, setNotifEnabled] = React.useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'LEAVE THE GUILD?',
      'You will be returned to the gate.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Log Out', style: 'destructive',
          onPress: () => navigation?.replace?.('Auth'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowBlob} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>⚔️</Text>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>7</Text>
            </View>
          </View>

          <Text style={styles.userName}>SHADOW HUNTER</Text>
          <Text style={styles.userEmail}>hunter@arise.com</Text>

          <View style={styles.rankPill}>
            <Text style={styles.rankPillText}>D RANK — NOVICE HUNTER</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>247</Text>
              <Text style={styles.statLbl}>QUESTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>12,430</Text>
              <Text style={styles.statLbl}>TOTAL XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>34</Text>
              <Text style={styles.statLbl}>DAY STREAK</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu */}
        <Animated.View style={[styles.menuCard, { opacity: fadeAnim }]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
              </View>
              {item.toggle ? (
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: '#1E2F50', true: '#1A6FFF' }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <Text style={styles.menuArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* App version */}
        <Text style={styles.version}>ARISE UP v1.0.0 — SOLO LEVELING</Text>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>⛔ LOG OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060A12' },
  glowBlob: {
    position: 'absolute', top: -40, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#1A3FBF', opacity: 0.25,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  profileCard: {
    backgroundColor: '#0D1526', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#1A2A4A', alignItems: 'center', marginBottom: 16,
  },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: '#1A6FFF',
    padding: 4,
    shadowColor: '#1A6FFF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 12,
  },
  avatar: {
    flex: 1, borderRadius: 50, backgroundColor: '#111D35',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36 },
  levelBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#1A6FFF', borderRadius: 12, width: 26, height: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#060A12',
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  userName: {
    color: '#FFFFFF', fontSize: 20, fontWeight: '900',
    letterSpacing: 3, marginBottom: 4,
  },
  userEmail: { color: '#3D4F6E', fontSize: 13, marginBottom: 12 },
  rankPill: {
    backgroundColor: '#1A6FFF18', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#1A6FFF44', marginBottom: 20,
  },
  rankPillText: { color: '#3DA9FC', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  statLbl: { color: '#3D4F6E', fontSize: 9, letterSpacing: 2, marginTop: 3, fontWeight: '700' },
  statDivider: { width: 1, backgroundColor: '#1A2A4A', marginVertical: 4 },
  menuCard: {
    backgroundColor: '#0D1526', borderRadius: 16,
    borderWidth: 1, borderColor: '#1A2A4A', marginBottom: 16, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#111D35' },
  menuIcon: { fontSize: 20, width: 32 },
  menuInfo: { flex: 1, marginLeft: 12 },
  menuLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  menuSub: { color: '#3D4F6E', fontSize: 11, marginTop: 2 },
  menuArrow: { color: '#3D4F6E', fontSize: 22, fontWeight: '300' },
  version: { color: '#1E2F50', fontSize: 10, textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
  logoutBtn: {
    backgroundColor: '#FF4D6D18', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF4D6D44',
  },
  logoutText: { color: '#FF4D6D', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});
