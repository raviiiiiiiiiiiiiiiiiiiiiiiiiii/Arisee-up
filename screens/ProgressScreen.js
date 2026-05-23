import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CHART_W = width - 96;
const CHART_H = 110;
const TREND = [1.5, 2.0, 1.8, 2.5, 3.0, 2.8, 3.5, 4.0, 3.8, 4.5, 5.0, 5.8];

function LineChart({ data, theme }) {
  const t = theme;
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
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 32, height: CHART_H, justifyContent: 'space-between', paddingVertical: PAD }}>
          <Text style={[styles.yLabel, { color: t.textMuted }]}>{max.toFixed(1)}</Text>
          <Text style={[styles.yLabel, { color: t.textMuted }]}>{((max + min) / 2).toFixed(1)}</Text>
          <Text style={[styles.yLabel, { color: t.textMuted }]}>{min.toFixed(1)}</Text>
        </View>

        <View style={{ width: CHART_W, height: CHART_H, position: 'relative' }}>
          {[0, 0.5, 1].map((v, i) => (
            <View key={i} style={[styles.gridH, { top: PAD + v * (CHART_H - PAD * 2), backgroundColor: t.cardBorder }]} />
          ))}
          {pts.slice(0, -1).map((pt, i) => {
            const next = pts[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={{
                position: 'absolute', left: pt.x, top: pt.y - 1,
                width: len, height: 2, backgroundColor: t.accentLight,
                transformOrigin: '0% 50%',
                transform: [{ rotate: `${angle}deg` }],
              }} />
            );
          })}
          {pts.map((pt, i) => (
            <View key={i} style={{
              position: 'absolute', left: pt.x - 4, top: pt.y - 4,
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: t.accentLight,
              borderWidth: 2, borderColor: t.bg,
            }} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingLeft: 32 }}>
        {['Dec', 'Jan', 'Feb'].map(l => (
          <Text key={l} style={[styles.xLabel, { color: t.textMuted }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { theme } = useAppContext();
  const t = theme;

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
    { label: 'Complete 10 Tasks', done: taskStats.completed >= 10, icon: <Ionicons name="checkmark-circle-outline" size={18} color={t.accentLight} /> },
    { label: '5 Day Streak', done: streak >= 5, icon: <MaterialCommunityIcons name="fire" size={18} color={t.accentLight} /> },
    { label: 'Reach Level 5', done: level >= 5, icon: <MaterialCommunityIcons name="shield-star-outline" size={18} color={t.accentLight} /> },
    { label: 'Earn 1000 XP', done: totalXP >= 1000, icon: <MaterialCommunityIcons name="crystal-ball" size={18} color={t.accentLight} /> },
  ];

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.pageTitle, { fontFamily: cinzelBold, color: t.text }]}>YOUR PROGRESS</Text>

          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <Text style={[styles.cardLabel, { color: t.textMuted }]}>Current Level</Text>
              <MaterialCommunityIcons name="trending-up" size={28} color={t.accent} style={{ marginBottom: 4 }} />
              <Text style={[styles.cardSmall, { color: t.accentLight }]}>Level Up</Text>
              <View style={[styles.miniBar, { backgroundColor: t.cardBorder }]}>
                <View style={[styles.miniBarFill, { width: `${xpProgress * 100}%`, backgroundColor: t.accent }]} />
              </View>
              <Text style={[styles.cardBig, { color: t.text }]}>Lvl {level}</Text>
              <Text style={[styles.cardSub, { color: t.textMuted }]}>Lvl {level + 1}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <Text style={[styles.cardLabel, { color: t.textMuted }]}>Total XP</Text>
              <MaterialCommunityIcons name="chevron-triple-up" size={28} color={t.accent} style={{ marginBottom: 4 }} />
              <Text style={[styles.cardBig, { color: t.text }]}>{totalXP.toLocaleString()} XP</Text>
              <Text style={[styles.cardSub, { color: t.textMuted }]}>+{xpToNext} to next</Text>
            </View>

            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <Text style={[styles.cardLabel, { color: t.textMuted }]}>Current Streak</Text>
              <MaterialCommunityIcons name="fire" size={28} color={t.accent} style={{ marginBottom: 4 }} />
              <Text style={[styles.cardBig, { color: t.text }]}>{streak} Days</Text>
            </View>

            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <Text style={[styles.cardLabel, { color: t.textMuted }]}>Tasks Completed</Text>
              <Ionicons name="checkmark-done-circle-outline" size={28} color={t.accent} style={{ marginBottom: 4 }} />
              <Text style={[styles.cardBig, { color: t.text }]}>{taskStats.completed} Tasks</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.chartTitle, { color: t.text }]}>Performance Trends (Last 3 Months)</Text>
            <LineChart data={TREND} theme={t} />
          </View>

          <View style={[styles.achCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.achTitle, { color: t.text }]}>Weekly Achievements</Text>
            {ACHIEVEMENTS.map((a, i) => (
              <View key={i} style={[styles.achRow, i < ACHIEVEMENTS.length - 1 && [styles.achBorder, { borderBottomColor: t.cardBorder }]]}>
                <View style={styles.achIconWrap}>{a.icon}</View>
                <Text style={[styles.achLabel, { color: t.textSub }]}>{a.label}</Text>
                <View style={[styles.achCircle, { borderColor: t.accent }, a.done && { backgroundColor: t.accent }]}>
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
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  pageTitle: { fontSize: 22, marginBottom: 24, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: { width: (width - 52) / 2, borderRadius: 16, padding: 16, borderWidth: 1, minHeight: 140 },
  cardLabel: { fontSize: 12, marginBottom: 6 },
  cardSmall: { fontSize: 11, marginBottom: 4 },
  miniBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  miniBarFill: { height: '100%', borderRadius: 2 },
  cardBig: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  cardSub: { fontSize: 11, marginTop: 2 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  chartTitle: { fontSize: 13 },
  yLabel: { fontSize: 10 },
  xLabel: { fontSize: 11 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
  achCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  achTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  achRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  achBorder: { borderBottomWidth: 1 },
  achIconWrap: { marginRight: 12 },
  achLabel: { flex: 1, fontSize: 14 },
  achCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
});
