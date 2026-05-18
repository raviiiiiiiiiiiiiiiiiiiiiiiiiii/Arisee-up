import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CHART_W = width - 96;
const CHART_H = 110;
const TREND = [1.5, 2.0, 1.8, 2.5, 3.0, 2.8, 3.5, 4.0, 3.8, 4.5, 5.0, 5.8];

function LineChart({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = CHART_W / (data.length - 1);
  const PAD = 8;

  const pts = data.map((v, i) => ({
    x: i * stepX,
    y: PAD + (1 - (v - min) / range) * (CHART_H - PAD * 2),
  }));

  return (
    <View style={{ marginTop: 12 }}>
      {/* Chart + Y labels side by side */}
      <View style={{ flexDirection: 'row' }}>
        {/* Y Labels */}
        <View style={{ width: 32, height: CHART_H, justifyContent: 'space-between', paddingVertical: PAD }}>
          <Text style={styles.yLabel}>{max.toFixed(1)}</Text>
          <Text style={styles.yLabel}>{((max + min) / 2).toFixed(1)}</Text>
          <Text style={styles.yLabel}>{min.toFixed(1)}</Text>
        </View>

        {/* Lines and dots */}
        <View style={{ width: CHART_W, height: CHART_H, position: 'relative' }}>
          {/* Horizontal grid */}
          {[0, 0.5, 1].map((v, i) => (
            <View key={i} style={[styles.gridH, { top: PAD + v * (CHART_H - PAD * 2) }]} />
          ))}

          {/* Line segments */}
          {pts.slice(0, -1).map((pt, i) => {
            const next = pts[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={{
                position: 'absolute',
                left: pt.x, top: pt.y - 1,
                width: len, height: 2,
                backgroundColor: '#A78BFF',
                transformOrigin: '0% 50%',
                transform: [{ rotate: `${angle}deg` }],
              }} />
            );
          })}

          {/* Dots */}
          {pts.map((pt, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: pt.x - 4, top: pt.y - 4,
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: '#A78BFF',
              borderWidth: 2, borderColor: '#0A0A12',
            }} />
          ))}
        </View>
      </View>

      {/* X Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingLeft: 32 }}>
        <Text style={styles.xLabel}>Dec</Text>
        <Text style={styles.xLabel}>Jan</Text>
        <Text style={styles.xLabel}>Feb</Text>
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const [userData, setUserData] = useState({ level: 1, totalXP: 0, streak: 0 });
  const [taskStats, setTaskStats] = useState({ completed: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(useCallback(() => {
    loadData();
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []));

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) setTaskStats({ completed: JSON.parse(tasks).filter(x => x.done).length });
    } catch {}
  };

  const level = userData.level || 1;
  const totalXP = userData.totalXP || 0;
  const xpToNext = 500 - (totalXP % 500);
  const streak = userData.streak || 0;
  const xpProgress = (totalXP % 500) / 500;

  const ACHIEVEMENTS = [
    { label: 'Complete 10 Tasks', done: taskStats.completed >= 10, icon: <Ionicons name="checkmark-circle-outline" size={18} color="#A78BFF" /> },
    { label: '5 Day Streak', done: streak >= 5, icon: <MaterialCommunityIcons name="fire" size={18} color="#A78BFF" /> },
    { label: 'Reach Level 5', done: level >= 5, icon: <MaterialCommunityIcons name="shield-star-outline" size={18} color="#A78BFF" /> },
    { label: 'Earn 1000 XP', done: totalXP >= 1000, icon: <MaterialCommunityIcons name="crystal-ball" size={18} color="#A78BFF" /> },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.pageTitle, { fontFamily: cinzelBold }]}>YOUR PROGRESS</Text>

          {/* 2x2 grid */}
          <View style={styles.grid}>
            {/* Current Level */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current Level</Text>
              <View style={styles.cardIconRow}>
                <MaterialCommunityIcons name="trending-up" size={28} color="#7B4FFF" />
              </View>
              <Text style={styles.cardSmall}>Level Up</Text>
              <View style={styles.miniBar}>
                <View style={[styles.miniBarFill, { width: `${xpProgress * 100}%` }]} />
              </View>
              <Text style={styles.cardBig}>Lvl {level}</Text>
              <Text style={styles.cardSub}>Lvl {level + 1}</Text>
            </View>

            {/* Total XP */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total XP</Text>
              <View style={styles.cardIconRow}>
                <MaterialCommunityIcons name="chevron-triple-up" size={28} color="#7B4FFF" />
              </View>
              <Text style={styles.cardBig}>{totalXP.toLocaleString()} XP</Text>
              <Text style={styles.cardSub}>+{xpToNext} to next</Text>
            </View>

            {/* Streak */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current Streak</Text>
              <View style={styles.cardIconRow}>
                <MaterialCommunityIcons name="fire" size={28} color="#7B4FFF" />
              </View>
              <Text style={styles.cardBig}>{streak} Days</Text>
            </View>

            {/* Tasks Completed */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Tasks Completed</Text>
              <View style={styles.cardIconRow}>
                <Ionicons name="checkmark-done-circle-outline" size={28} color="#7B4FFF" />
              </View>
              <Text style={styles.cardBig}>{taskStats.completed} Tasks</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Performance Trends (Last 3 Months)</Text>
            <LineChart data={TREND} />
          </View>

          {/* Achievements */}
          <View style={styles.achCard}>
            <Text style={styles.achTitle}>Weekly Achievements</Text>
            {ACHIEVEMENTS.map((a, i) => (
              <View key={i} style={[styles.achRow, i < ACHIEVEMENTS.length - 1 && styles.achBorder]}>
                <View style={styles.achIconWrap}>{a.icon}</View>
                <Text style={styles.achLabel}>{a.label}</Text>
                <View style={[styles.achCircle, a.done && styles.achCircleDone]}>
                  {a.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12' },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  pageTitle: { fontSize: 22, color: '#FFFFFF', marginBottom: 24, letterSpacing: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: {
    width: (width - 52) / 2, backgroundColor: '#12121E',
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E1E30', minHeight: 140,
  },
  cardLabel: { color: '#555577', fontSize: 12, marginBottom: 6 },
  cardIconRow: { marginBottom: 4 },
  cardSmall: { color: '#A78BFF', fontSize: 11, marginBottom: 4 },
  miniBar: { height: 4, backgroundColor: '#1E1E30', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  miniBarFill: { height: '100%', backgroundColor: '#7B4FFF', borderRadius: 2 },
  cardBig: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 2 },
  cardSub: { color: '#555577', fontSize: 11, marginTop: 2 },

  chartCard: {
    backgroundColor: '#12121E', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1E1E30', marginBottom: 16,
  },
  chartTitle: { color: '#FFFFFF', fontSize: 13 },
  yLabel: { color: '#555577', fontSize: 10 },
  xLabel: { color: '#555577', fontSize: 11 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#1E1E30' },

  achCard: {
    backgroundColor: '#12121E', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1E1E30',
  },
  achTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  achRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  achBorder: { borderBottomWidth: 1, borderBottomColor: '#1E1E30' },
  achIconWrap: { marginRight: 12 },
  achLabel: { flex: 1, color: '#CCCCDD', fontSize: 14 },
  achCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#7B4FFF', justifyContent: 'center', alignItems: 'center' },
  achCircleDone: { backgroundColor: '#7B4FFF' },
});
