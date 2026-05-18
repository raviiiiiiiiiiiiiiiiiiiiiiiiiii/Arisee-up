import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CHART_DATA = [2.1, 2.8, 2.4, 3.2, 3.8, 3.5, 4.2, 4.0, 4.8, 5.2, 5.6, 6.0];
const CHART_LABELS = ['Dec', 'Jan', 'Feb'];

function MiniChart() {
  const maxVal = Math.max(...CHART_DATA);
  const chartH = 120;
  const chartW = width - 80;
  const stepX = chartW / (CHART_DATA.length - 1);

  const points = CHART_DATA.map((v, i) => ({
    x: i * stepX,
    y: chartH - (v / maxVal) * chartH,
  }));

  const drawAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drawAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
  }, []);

  // Build SVG-like path string manually using View lines
  return (
    <View style={{ height: chartH + 30, marginTop: 8 }}>
      {/* Y axis labels */}
      {[0, 2.5, 5.0, 6.0].map((v, i) => (
        <Text key={i} style={[styles.chartYLabel, { bottom: (v / maxVal) * chartH }]}>
          {v}
        </Text>
      ))}

      {/* Chart lines between points */}
      <View style={{ position: 'absolute', left: 30, right: 0, top: 0 }}>
        {points.slice(0, -1).map((pt, i) => {
          const next = points[i + 1];
          const dx = next.x - pt.x;
          const dy = next.y - pt.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View key={i} style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y,
              width: len,
              height: 2,
              backgroundColor: '#A78BFF',
              opacity: 0.8,
              transform: [{ rotate: `${angle}deg` }, { translateY: -1 }],
              transformOrigin: '0 50%',
            }} />
          );
        })}

        {/* Dots */}
        {points.map((pt, i) => (
          <View key={i} style={{
            position: 'absolute', left: pt.x - 4, top: pt.y - 4,
            width: 8, height: 8, borderRadius: 4, backgroundColor: '#A78BFF',
          }} />
        ))}
      </View>

      {/* X labels */}
      <View style={{ position: 'absolute', bottom: 0, left: 30, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
        {CHART_LABELS.map(l => (
          <Text key={l} style={styles.chartXLabel}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const [userData, setUserData] = useState({ level: 1, totalXP: 0, streak: 0 });
  const [taskStats, setTaskStats] = useState({ completed: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(useCallback(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []));

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) {
        const t = JSON.parse(tasks);
        setTaskStats({ completed: t.filter(x => x.done).length });
      }
    } catch {}
  };

  const level = userData.level || 1;
  const totalXP = userData.totalXP || 0;
  const xpToNext = 500 - (totalXP % 500);
  const streak = userData.streak || 0;

  const STAT_CARDS = [
    { label: 'Current Level', icon: '📈', value: `Lvl ${level}`, sub: `Lvl ${level + 1}`, type: 'level' },
    { label: 'Total XP', icon: '🔮', value: `${totalXP.toLocaleString()} XP`, sub: `+${xpToNext} to next`, type: 'xp' },
    { label: 'Current Streak', icon: '🔥', value: `${streak} Days`, sub: 'Keep it up!', type: 'streak' },
    { label: 'Tasks Completed', icon: '✅', value: `${taskStats.completed} Tasks`, sub: 'Total done', type: 'tasks' },
  ];

  const ACHIEVEMENTS = [
    { label: 'Complete 10 Tasks', done: taskStats.completed >= 10 },
    { label: '5 Day Streak', done: streak >= 5 },
    { label: 'Reach Level 5', done: level >= 5 },
    { label: 'Earn 1000 XP', done: totalXP >= 1000 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.pageTitle, { fontFamily: cinzelBold }]}>Your Progress</Text>

          {/* 2x2 Stat Cards */}
          <View style={styles.statsGrid}>
            {STAT_CARDS.map((card, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statCardLabel}>{card.label}</Text>
                {card.type === 'level' && (
                  <View style={styles.levelArcWrap}>
                    <Text style={styles.levelArcText}>Level Up</Text>
                    <View style={styles.levelArcBar}>
                      <View style={[styles.levelArcFill, { width: `${((totalXP % 500) / 500) * 100}%` }]} />
                    </View>
                  </View>
                )}
                {card.type !== 'level' && (
                  <Text style={styles.statCardIcon}>{card.icon}</Text>
                )}
                <Text style={styles.statCardValue}>{card.value}</Text>
                {card.type === 'level' && (
                  <Text style={styles.statCardSub}>Lvl {level + 1}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Performance Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Performance Trends (Last 3 Months)</Text>
            <MiniChart />
          </View>

          {/* Weekly Achievements */}
          <View style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>Weekly Achievements</Text>
            {ACHIEVEMENTS.map((a, i) => (
              <View key={i} style={[styles.achievementRow, i < ACHIEVEMENTS.length - 1 && styles.achievementBorder]}>
                <Text style={styles.achievementLabel}>{a.label}</Text>
                <View style={[styles.achievementCircle, a.done && styles.achievementCircleDone]}>
                  {a.done && <Text style={styles.achievementCheck}>✓</Text>}
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
  pageTitle: { fontSize: 30, color: '#FFFFFF', marginBottom: 24 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: (width - 52) / 2, backgroundColor: '#12121E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E1E30', minHeight: 130, justifyContent: 'space-between' },
  statCardLabel: { color: '#555577', fontSize: 12, marginBottom: 8 },
  statCardIcon: { fontSize: 32, marginBottom: 4 },
  statCardValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  statCardSub: { color: '#555577', fontSize: 11 },

  levelArcWrap: { marginBottom: 4 },
  levelArcText: { color: '#A78BFF', fontSize: 11, marginBottom: 6 },
  levelArcBar: { height: 4, backgroundColor: '#1E1E30', borderRadius: 2, overflow: 'hidden' },
  levelArcFill: { height: '100%', backgroundColor: '#7B4FFF', borderRadius: 2 },

  chartCard: { backgroundColor: '#12121E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E1E30', marginBottom: 16 },
  chartTitle: { color: '#FFFFFF', fontSize: 13, marginBottom: 4 },
  chartYLabel: { position: 'absolute', left: 0, color: '#555577', fontSize: 10 },
  chartXLabel: { color: '#555577', fontSize: 11 },

  achievementsCard: { backgroundColor: '#12121E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E1E30' },
  achievementsTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  achievementBorder: { borderBottomWidth: 1, borderBottomColor: '#1E1E30' },
  achievementLabel: { flex: 1, color: '#CCCCDD', fontSize: 14 },
  achievementCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#7B4FFF', justifyContent: 'center', alignItems: 'center' },
  achievementCircleDone: { backgroundColor: '#7B4FFF' },
  achievementCheck: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
