import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const RANKS = [
  { rank: 'E', label: 'Unawakened', color: '#555', minLevel: 1 },
  { rank: 'D', label: 'Novice Hunter', color: '#4CAF50', minLevel: 5 },
  { rank: 'C', label: 'Iron Hunter', color: '#3DA9FC', minLevel: 15 },
  { rank: 'B', label: 'Steel Hunter', color: '#A78BFF', minLevel: 30 },
  { rank: 'A', label: 'Shadow Knight', color: '#FF9F1C', minLevel: 50 },
  { rank: 'S', label: 'Shadow Monarch', color: '#FF4060', minLevel: 80 },
];

const STAT_LABELS = ['STRENGTH', 'AGILITY', 'STAMINA', 'FOCUS'];
const STAT_COLORS = ['#FF4060', '#FF9F1C', '#A78BFF', '#3DA9FC'];

function StatBar({ label, value, color, cinzel, delay }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(barAnim, { toValue: value / 100, duration: 900, delay, useNativeDriver: false }),
    ]).start();
  }, [value]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${value}%`] });

  return (
    <Animated.View style={[styles.statRow, { opacity: fadeAnim }]}>
      <View style={styles.statLabelRow}>
        <Text style={[styles.statLabel, { fontFamily: cinzel }]}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.statBarBg}>
        <Animated.View style={[styles.statBarFill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
}

export default function LevelScreen() {
  const [userData, setUserData] = useState({ level: 1, xp: 0, totalXP: 0, streak: 0, username: 'Hunter' });
  const [stats, setStats] = useState([20, 20, 20, 20]);
  const [displayLevel, setDisplayLevel] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const xpBarAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_data');
      if (stored) {
        const u = JSON.parse(stored);
        setUserData(u);

        // Derive stats from totalXP
        const base = Math.min(u.totalXP / 20, 100);
        setStats([
          Math.min(Math.floor(base * 0.9 + 10), 100),
          Math.min(Math.floor(base * 1.1 + 5), 100),
          Math.min(Math.floor(base * 0.8 + 15), 100),
          Math.min(Math.floor(base * 1.0 + 8), 100),
        ]);

        animateIn(u.level, u.xp % 500, 500);
      }
    } catch {}
  };

  const animateIn = (level, currentXP, nextXP) => {
    const progress = currentXP / nextXP;
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    xpBarAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(xpBarAnim, { toValue: progress, duration: 1200, delay: 300, useNativeDriver: false }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDisplayLevel(count);
      if (count >= level) clearInterval(interval);
    }, 80);
  };

  const level = userData.level || 1;
  const currentXP = (userData.totalXP || 0) % 500;
  const nextXP = 500;
  const currentRank = RANKS.filter(r => level >= r.minLevel).pop() || RANKS[0];

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  const xpBarWidth = xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(currentXP / nextXP) * 100}%`] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowOrb, { opacity: glowOpacity }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={[styles.pageTitle, { fontFamily: cinzel }]}>HUNTER STATUS</Text>

        {/* Level Orb */}
        <Animated.View style={[styles.orbWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.orbRing3} /><View style={styles.orbRing2} /><View style={styles.orbRing1} />
          <View style={styles.orb}>
            <Text style={[styles.levelLabel, { fontFamily: cinzel }]}>LEVEL</Text>
            <Text style={[styles.levelNumber, { fontFamily: cinzelBold }]}>{displayLevel}</Text>
            <Text style={[styles.rankBadge, { color: currentRank.color, fontFamily: cinzel }]}>
              {currentRank.rank} RANK
            </Text>
          </View>
        </Animated.View>

        <Text style={[styles.rankTitle, { color: currentRank.color, fontFamily: cinzelBold }]}>
          {currentRank.label}
        </Text>

        {/* XP Bar */}
        <Animated.View style={[styles.xpCard, { opacity: fadeAnim }]}>
          <View style={styles.xpRow}>
            <Text style={[styles.xpLabel, { fontFamily: cinzel }]}>EXPERIENCE POINTS</Text>
            <Text style={styles.xpNumbers}>
              <Text style={styles.xpCurrent}>{currentXP}</Text>
              <Text style={styles.xpSep}> / </Text>
              <Text style={styles.xpNext}>{nextXP} XP</Text>
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <Animated.View style={[styles.xpBarFill, { width: xpBarWidth }]} />
          </View>
          <Text style={styles.xpToNext}>{nextXP - currentXP} XP to Level {level + 1}</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={[styles.cardTitle, { fontFamily: cinzelBold }]}>HUNTER ATTRIBUTES</Text>
          {STAT_LABELS.map((label, i) => (
            <StatBar key={label} label={label} value={stats[i]} color={STAT_COLORS[i]}
              cinzel={cinzel} delay={i * 120 + 200} />
          ))}
        </View>

        {/* Ranks */}
        <View style={styles.ranksCard}>
          <Text style={[styles.cardTitle, { fontFamily: cinzelBold }]}>RANK PROGRESSION</Text>
          <View style={styles.ranksList}>
            {RANKS.map(r => {
              const isUnlocked = level >= r.minLevel;
              const isCurrent = r.rank === currentRank.rank;
              return (
                <View key={r.rank} style={[styles.rankItem, isCurrent && styles.rankItemActive]}>
                  <View style={[styles.rankCircle, { borderColor: r.color }, isUnlocked && { backgroundColor: r.color + '22' }]}>
                    <Text style={[styles.rankCircleText, { color: isUnlocked ? r.color : '#1A1F35', fontFamily: cinzelBold }]}>
                      {r.rank}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankName, { color: isUnlocked ? '#FFFFFF' : '#1A1F35', fontFamily: cinzel }]}>{r.label}</Text>
                    <Text style={[styles.rankMin, { color: isUnlocked ? r.color : '#1A1F35' }]}>Lv. {r.minLevel}+</Text>
                  </View>
                  {isCurrent && <Text style={[styles.currentTag, { fontFamily: cinzel }]}>CURRENT</Text>}
                  {isUnlocked && !isCurrent && <Text style={styles.doneTag}>✓</Text>}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090F' },
  glowOrb: { position: 'absolute', top: 80, alignSelf: 'center', width: 300, height: 300, borderRadius: 150, backgroundColor: '#2A1580', opacity: 0.3 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  pageTitle: { fontSize: 11, color: '#A78BFF', letterSpacing: 4, marginBottom: 30 },
  orbWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16, width: 220, height: 220 },
  orbRing3: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#5B2FFF15' },
  orbRing2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: '#5B2FFF25' },
  orbRing1: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1.5, borderColor: '#5B2FFF40' },
  orb: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#0C0F1E', borderWidth: 2, borderColor: '#5B2FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#5B2FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 15 },
  levelLabel: { color: '#3D4060', fontSize: 9, letterSpacing: 3 },
  levelNumber: { color: '#FFFFFF', fontSize: 44, lineHeight: 50, textShadowColor: '#A78BFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  rankBadge: { fontSize: 10, letterSpacing: 1.5 },
  rankTitle: { fontSize: 16, letterSpacing: 2, marginBottom: 24 },
  xpCard: { backgroundColor: '#0C0F1E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1A1F35', width: '100%', marginBottom: 16 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpLabel: { color: '#3D4060', fontSize: 9, letterSpacing: 2 },
  xpNumbers: {},
  xpCurrent: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  xpSep: { color: '#3D4060', fontSize: 12 },
  xpNext: { color: '#3D4060', fontSize: 12 },
  xpBarBg: { backgroundColor: '#10142A', borderRadius: 8, height: 12, overflow: 'hidden', marginBottom: 8 },
  xpBarFill: { height: '100%', backgroundColor: '#5B2FFF', borderRadius: 8 },
  xpToNext: { color: '#3D4060', fontSize: 11, textAlign: 'right' },
  statsCard: { backgroundColor: '#0C0F1E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1A1F35', width: '100%', marginBottom: 16 },
  cardTitle: { color: '#FFFFFF', fontSize: 10, letterSpacing: 3, marginBottom: 18 },
  statRow: { marginBottom: 14 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { color: '#3D4060', fontSize: 10, letterSpacing: 1.5 },
  statValue: { fontSize: 13, fontWeight: '800' },
  statBarBg: { backgroundColor: '#10142A', borderRadius: 4, height: 6, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 4 },
  ranksCard: { backgroundColor: '#0C0F1E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1A1F35', width: '100%' },
  ranksList: { gap: 10 },
  rankItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#10142A' },
  rankItemActive: { borderWidth: 1, borderColor: '#5B2FFF55', backgroundColor: '#5B2FFF11' },
  rankCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankCircleText: { fontSize: 14 },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 13 },
  rankMin: { fontSize: 11, marginTop: 2 },
  currentTag: { backgroundColor: '#5B2FFF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, color: '#FFFFFF', fontSize: 8, letterSpacing: 1 },
  doneTag: { color: '#4CAF50', fontSize: 16, fontWeight: '900' },
});
