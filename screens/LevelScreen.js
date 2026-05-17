import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Animated, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const RANKS = [
  { rank: 'E', label: 'Unawakened', color: '#888', minLevel: 1 },
  { rank: 'D', label: 'Novice Hunter', color: '#4CAF50', minLevel: 5 },
  { rank: 'C', label: 'Iron Hunter', color: '#3DA9FC', minLevel: 15 },
  { rank: 'B', label: 'Steel Hunter', color: '#7B61FF', minLevel: 30 },
  { rank: 'A', label: 'Shadow Knight', color: '#FF9F1C', minLevel: 50 },
  { rank: 'S', label: 'Shadow Monarch', color: '#FF4D6D', minLevel: 80 },
];

const STATS = [
  { label: 'STRENGTH', value: 24, max: 100, color: '#FF4D6D' },
  { label: 'AGILITY', value: 41, max: 100, color: '#FF9F1C' },
  { label: 'STAMINA', value: 67, max: 100, color: '#3DA9FC' },
  { label: 'FOCUS', value: 55, max: 100, color: '#7B61FF' },
];

function StatBar({ stat, delay }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(barAnim, { toValue: stat.value / stat.max, duration: 900, delay, useNativeDriver: false }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${(stat.value / stat.max) * 100}%`],
  });

  return (
    <Animated.View style={[styles.statRow, { opacity: fadeAnim }]}>
      <View style={styles.statLabelRow}>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
      </View>
      <View style={styles.statBarBg}>
        <Animated.View style={[styles.statBarFill, { width: barWidth, backgroundColor: stat.color }]} />
      </View>
    </Animated.View>
  );
}

export default function LevelScreen() {
  const level = 7;
  const currentXP = 2340;
  const nextLevelXP = 3000;
  const xpProgress = currentXP / nextLevelXP;
  const currentRank = RANKS[1]; // D rank at level 7

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const xpBarAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(xpBarAnim, { toValue: xpProgress, duration: 1200, delay: 300, useNativeDriver: false }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Count up level number
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDisplayLevel(count);
      if (count >= level) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });
  const xpBarWidth = xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${xpProgress * 100}%`] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowOrb, { opacity: glowOpacity }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.pageTitle}>HUNTER STATUS</Text>

        {/* Level Orb */}
        <Animated.View style={[styles.orbWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.orbRing3} />
          <View style={styles.orbRing2} />
          <View style={styles.orbRing1} />
          <View style={styles.orb}>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={styles.levelNumber}>{displayLevel}</Text>
            <Text style={[styles.rankBadge, { color: currentRank.color }]}>{currentRank.rank} RANK</Text>
          </View>
        </Animated.View>

        <Text style={[styles.rankTitle, { color: currentRank.color }]}>{currentRank.label}</Text>

        {/* XP Bar */}
        <Animated.View style={[styles.xpCard, { opacity: fadeAnim }]}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>EXPERIENCE POINTS</Text>
            <Text style={styles.xpNumbers}>
              <Text style={styles.xpCurrent}>{currentXP.toLocaleString()}</Text>
              <Text style={styles.xpSep}> / </Text>
              <Text style={styles.xpNext}>{nextLevelXP.toLocaleString()}</Text>
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <Animated.View style={[styles.xpBarFill, { width: xpBarWidth }]} />
            <View style={[styles.xpBarGlow, { left: `${xpProgress * 100 - 2}%` }]} />
          </View>
          <Text style={styles.xpToNext}>
            {(nextLevelXP - currentXP).toLocaleString()} XP to Level {level + 1}
          </Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>HUNTER ATTRIBUTES</Text>
          {STATS.map((stat, i) => (
            <StatBar key={stat.label} stat={stat} delay={i * 120 + 200} />
          ))}
        </View>

        {/* Rank Progression */}
        <View style={styles.ranksCard}>
          <Text style={styles.cardTitle}>RANK PROGRESSION</Text>
          <View style={styles.ranksList}>
            {RANKS.map((r, i) => {
              const isUnlocked = level >= r.minLevel;
              const isCurrent = r.rank === currentRank.rank;
              return (
                <View key={r.rank} style={[styles.rankItem, isCurrent && styles.rankItemActive]}>
                  <View style={[
                    styles.rankCircle,
                    { borderColor: r.color },
                    isUnlocked && { backgroundColor: r.color + '22' },
                  ]}>
                    <Text style={[styles.rankCircleText, { color: isUnlocked ? r.color : '#2A3A5A' }]}>
                      {r.rank}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankName, { color: isUnlocked ? '#FFFFFF' : '#2A3A5A' }]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.rankMin, { color: isUnlocked ? r.color : '#2A3A5A' }]}>
                      Lv. {r.minLevel}+
                    </Text>
                  </View>
                  {isCurrent && <Text style={styles.currentTag}>CURRENT</Text>}
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
  container: { flex: 1, backgroundColor: '#060A12' },
  glowOrb: {
    position: 'absolute', top: 80, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#1A3FBF', opacity: 0.3,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  pageTitle: {
    fontSize: 13, fontWeight: '800', color: '#3DA9FC',
    letterSpacing: 4, marginBottom: 30,
  },
  orbWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16, width: 220, height: 220 },
  orbRing3: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: '#1A6FFF15',
  },
  orbRing2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: '#1A6FFF25',
  },
  orbRing1: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    borderWidth: 1.5, borderColor: '#1A6FFF40',
  },
  orb: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#0D1526', borderWidth: 2, borderColor: '#1A6FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1A6FFF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 15,
  },
  levelLabel: { color: '#3D4F6E', fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  levelNumber: {
    color: '#FFFFFF', fontSize: 44, fontWeight: '900',
    lineHeight: 50, textShadowColor: '#3DA9FC',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  rankBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  rankTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 2, marginBottom: 24 },
  xpCard: {
    backgroundColor: '#0D1526', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1A2A4A', width: '100%', marginBottom: 16,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  xpLabel: { color: '#3D4F6E', fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  xpNumbers: {},
  xpCurrent: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  xpSep: { color: '#3D4F6E', fontSize: 12 },
  xpNext: { color: '#3D4F6E', fontSize: 12 },
  xpBarBg: {
    backgroundColor: '#111D35', borderRadius: 8, height: 12,
    overflow: 'hidden', position: 'relative', marginBottom: 8,
  },
  xpBarFill: {
    height: '100%', backgroundColor: '#1A6FFF', borderRadius: 8,
  },
  xpBarGlow: {
    position: 'absolute', top: 0, bottom: 0, width: 20,
    backgroundColor: '#FFFFFF', opacity: 0.3, borderRadius: 8,
  },
  xpToNext: { color: '#3D4F6E', fontSize: 11, textAlign: 'right' },
  statsCard: {
    backgroundColor: '#0D1526', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1A2A4A', width: '100%', marginBottom: 16,
  },
  cardTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 18 },
  statRow: { marginBottom: 14 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { color: '#3D4F6E', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  statValue: { fontSize: 13, fontWeight: '800' },
  statBarBg: { backgroundColor: '#111D35', borderRadius: 4, height: 6, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 4 },
  ranksCard: {
    backgroundColor: '#0D1526', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1A2A4A', width: '100%',
  },
  ranksList: { gap: 12 },
  rankItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, backgroundColor: '#111D35',
  },
  rankItemActive: { borderWidth: 1, borderColor: '#1A6FFF55', backgroundColor: '#1A6FFF11' },
  rankCircle: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rankCircleText: { fontSize: 14, fontWeight: '900' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 13, fontWeight: '700' },
  rankMin: { fontSize: 11, marginTop: 2 },
  currentTag: {
    backgroundColor: '#1A6FFF', borderRadius: 6, paddingHorizontal: 8,
    paddingVertical: 3, color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1,
  },
  doneTag: { color: '#4CAF50', fontSize: 16, fontWeight: '900' },
});
