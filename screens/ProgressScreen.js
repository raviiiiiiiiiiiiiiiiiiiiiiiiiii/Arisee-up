import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../ads/AdConfig';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;
const CHART_W = width - 96;
const CHART_H = 110;

// Build chart data from daily XP history stored in AsyncStorage
// Falls back to a flat line if no history yet
function buildChartData(history) {
  if (!history || history.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  // Pad to 7 points
  const data = [...history];
  while (data.length < 7) data.unshift(0);
  return data.slice(-7);
}

function LineChart({ data, theme }) {
  const t = theme;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? CHART_W / (data.length - 1) : CHART_W;
  const PAD = 10;

  const pts = data.map((v, i) => ({
    x: i * stepX,
    y: PAD + (1 - (v - min) / range) * (CHART_H - PAD * 2),
  }));

  const yTop = max.toFixed(0);
  const yMid = ((max + min) / 2).toFixed(0);
  const yBot = min.toFixed(0);

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Y axis labels */}
        <View style={{ width: 28, height: CHART_H, justifyContent: 'space-between', paddingVertical: PAD }}>
          <Text style={[styles.axisLabel, { color: t.textMuted }]}>{yTop}</Text>
          <Text style={[styles.axisLabel, { color: t.textMuted }]}>{yMid}</Text>
          <Text style={[styles.axisLabel, { color: t.textMuted }]}>{yBot}</Text>
        </View>

        {/* Chart */}
        <View style={{ width: CHART_W, height: CHART_H }}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((v, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: 0, right: 0,
              top: PAD + v * (CHART_H - PAD * 2),
              height: 1,
              backgroundColor: t.cardBorder,
            }} />
          ))}

          {/* Line segments */}
          {pts.length > 1 && pts.slice(0, -1).map((pt, i) => {
            const next = pts[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={{
                position: 'absolute',
                left: pt.x,
                top: pt.y - 1,
                width: len,
                height: 2,
                backgroundColor: t.accentLight,
                transformOrigin: '0% 50%',
                transform: [{ rotate: `${angle}deg` }],
              }} />
            );
          })}

          {/* Dots */}
          {pts.map((pt, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: pt.x - 4,
              top: pt.y - 4,
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: t.accentLight,
              borderWidth: 2,
              borderColor: t.bg,
            }} />
          ))}
        </View>
      </View>

      {/* X labels — last 7 days */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingLeft: 28 }}>
        {data.map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (data.length - 1 - i));
          const label = i === data.length - 1 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' });
          return <Text key={i} style={[styles.axisLabel, { color: t.textMuted, fontSize: 9 }]}>{label}</Text>;
        })}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { theme } = useAppContext();
  const t = theme;

  const [userData, setUserData] = useState({ level: 1, totalXP: 0, streak: 0 });
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(useCallback(() => {
    // Don't animate opacity on refocus — just reload data
    // This prevents layout breaks from opacity animation stacking
    loadData();
  }, []));

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));

      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) {
        const t2 = JSON.parse(tasks);
        setTaskStats({
          completed: t2.filter(x => x.done).length,
          total: t2.length,
        });
      }

      // Load real XP history
      const history = await AsyncStorage.getItem('xp_daily_history');
      if (history) {
        setChartData(buildChartData(JSON.parse(history)));
      }
    } catch {}
  };

  const level = userData.level || 1;
  const totalXP = userData.totalXP || 0;
  // XP within current level = totalXP mod 500
  const xpInCurrentLevel = totalXP % 500;
  const xpToNext = 500 - xpInCurrentLevel;
  const streak = userData.streak || 0;
  const xpProgress = xpInCurrentLevel / 500;

  const ACHIEVEMENTS = [
    {
      label: 'Complete 10 Tasks',
      done: taskStats.completed >= 10,
      icon: <Ionicons name="checkmark-circle-outline" size={18} color={t.accentLight} />,
    },
    {
      label: '5 Day Streak',
      done: streak >= 5,
      icon: <MaterialCommunityIcons name="fire" size={18} color={t.accentLight} />,
    },
    {
      label: 'Reach Level 5',
      done: level >= 5,
      icon: <MaterialCommunityIcons name="shield-star-outline" size={18} color={t.accentLight} />,
    },
    {
      label: 'Earn 1000 XP',
      done: totalXP >= 1000,
      icon: <MaterialCommunityIcons name="crystal-ball" size={18} color={t.accentLight} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        // Fix layout break on minimize/restore
        removeClippedSubviews={false}
      >
        <Text style={[styles.pageTitle, { fontFamily: cinzelBold, color: t.text }]}>YOUR PROGRESS</Text>

        {/* 2x2 stat grid — fixed heights, no animation that breaks layout */}
        <View style={styles.grid}>
          {/* Current Level */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder, width: CARD_W }]}>
            <Text style={[styles.cardLabel, { color: t.textMuted }]}>Current Level</Text>
            <MaterialCommunityIcons name="trending-up" size={26} color={t.accent} style={{ marginVertical: 4 }} />
            <Text style={[styles.cardSmall, { color: t.accentLight }]}>Level Up</Text>
            <View style={[styles.miniBar, { backgroundColor: t.cardBorder }]}>
              <View style={[styles.miniBarFill, { width: `${Math.min(xpProgress * 100, 100)}%`, backgroundColor: t.accent }]} />
            </View>
            <Text style={[styles.cardBig, { color: t.text }]}>Lvl {level}</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>{xpInCurrentLevel} / 500 XP</Text>
          </View>

          {/* Total XP */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder, width: CARD_W }]}>
            <Text style={[styles.cardLabel, { color: t.textMuted }]}>Total XP</Text>
            <MaterialCommunityIcons name="chevron-triple-up" size={26} color={t.accent} style={{ marginVertical: 4 }} />
            <Text style={[styles.cardBig, { color: t.text }]}>{totalXP} XP</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>+{xpToNext} to Lvl {level + 1}</Text>
          </View>

          {/* Streak */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder, width: CARD_W }]}>
            <Text style={[styles.cardLabel, { color: t.textMuted }]}>Current Streak</Text>
            <MaterialCommunityIcons name="fire" size={26} color={t.accent} style={{ marginVertical: 4 }} />
            <Text style={[styles.cardBig, { color: t.text }]}>{streak} Days</Text>
          </View>

          {/* Tasks Completed */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder, width: CARD_W }]}>
            <Text style={[styles.cardLabel, { color: t.textMuted }]}>Tasks Done</Text>
            <Ionicons name="checkmark-done-circle-outline" size={26} color={t.accent} style={{ marginVertical: 4 }} />
            <Text style={[styles.cardBig, { color: t.text }]}>{taskStats.completed}</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>of {taskStats.total} today</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <Text style={[styles.chartTitle, { color: t.text }]}>XP Earned (Last 7 Days)</Text>
          <LineChart data={chartData} theme={t} />
        </View>

        {/* Achievements */}
        <View style={[styles.achCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <Text style={[styles.achTitle, { color: t.text }]}>Achievements</Text>
          {ACHIEVEMENTS.map((a, i) => (
            <View key={i} style={[
              styles.achRow,
              i < ACHIEVEMENTS.length - 1 && [styles.achBorder, { borderBottomColor: t.cardBorder }],
            ]}>
              <View style={styles.achIconWrap}>{a.icon}</View>
              <Text style={[styles.achLabel, { color: t.textSub }]}>{a.label}</Text>
              <View style={[styles.achCircle, { borderColor: t.accent }, a.done && { backgroundColor: t.accent }]}>
                {a.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <View style={{ alignItems: 'center', backgroundColor: t.bg }}>
        <BannerAd unitId={AD_UNITS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  pageTitle: { fontSize: 22, marginBottom: 20, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, minHeight: 130 },
  cardLabel: { fontSize: 11, marginBottom: 2 },
  cardSmall: { fontSize: 10, marginBottom: 4 },
  miniBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  miniBarFill: { height: '100%', borderRadius: 2 },
  cardBig: { fontSize: 19, fontWeight: '700' },
  cardSub: { fontSize: 10, marginTop: 2 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  axisLabel: { fontSize: 10 },
  achCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  achTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  achRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  achBorder: { borderBottomWidth: 1 },
  achIconWrap: { marginRight: 12 },
  achLabel: { flex: 1, fontSize: 14 },
  achCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
});
