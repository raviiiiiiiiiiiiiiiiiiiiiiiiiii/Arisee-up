import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal, Alert, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const TASK_ICONS = ['⚔️', '🧠', '💧', '🏃', '📚', '💪', '🎯', '🔥'];

const DEFAULT_TASKS = [
  { id: '1', title: 'Exercise', xp: 10, done: false, icon: '🏃' },
  { id: '2', title: 'Study', xp: 10, done: false, icon: '🧠' },
  { id: '3', title: 'Hydration', xp: 10, done: false, icon: '💧' },
];

// ── Quest Completed Popup ──────────────────────────────────────────
function QuestCompletedModal({ visible, task, onDone }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      [particle1, particle2, particle3].forEach(p => p.setValue(0));

      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(particle1, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(particle2, { toValue: 1, duration: 1500, delay: 200, useNativeDriver: true }),
        Animated.timing(particle3, { toValue: 1, duration: 1800, delay: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const makeParticle = (anim, x, y) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
    transform: [
      { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
      { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 0.5] }) },
    ],
  });

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.questModalOverlay, { opacity: fadeAnim }]}>
        {/* Particles */}
        {[
          [particle1, -80, -120], [particle2, 80, -100], [particle3, -40, -150],
          [particle1, 100, -80], [particle2, -100, -60], [particle3, 60, -130],
        ].map(([anim, x, y], i) => (
          <Animated.View key={i} style={[styles.particle, makeParticle(anim, x, y)]} />
        ))}

        <Animated.View style={[styles.questModalCard, { transform: [{ scale: scaleAnim }] }]}>
          {/* Check circle */}
          <View style={styles.checkCircleWrap}>
            <View style={styles.checkCircleRing} />
            <View style={styles.checkCircle}>
              <Text style={styles.checkCircleIcon}>✓</Text>
            </View>
          </View>

          <Text style={styles.questCompletedTitle}>Quest Completed</Text>
          <Text style={styles.questXPEarned}>+{task.xp} XP Earned 🔮</Text>
          <Text style={styles.questPriority}>{task.title}</Text>

          <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Level Up Screen ────────────────────────────────────────────────
function LevelUpModal({ visible, fromLevel, toLevel, onContinue }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      barAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(barAnim, { toValue: 1, duration: 1200, delay: 600, useNativeDriver: false }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.levelUpOverlay}>
        <Animated.View style={[styles.levelUpGlow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.levelUpGlow2, { opacity: glowOpacity }]} />

        <Animated.View style={[styles.levelUpCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.levelUpTitle}>LEVEL UP</Text>

          <View style={styles.levelUpRow}>
            <Text style={styles.levelUpFrom}>Level {fromLevel}</Text>
            <Text style={styles.levelUpArrow}>→</Text>
            <Text style={styles.levelUpTo}>Level {toLevel}</Text>
          </View>

          <View style={styles.levelUpBarBg}>
            <Animated.View style={[styles.levelUpBarFill, { width: barWidth }]} />
          </View>

          <Text style={styles.achievementLabel}>ACHIEVEMENT UNLOCKED:</Text>
          <Text style={styles.achievementName}>PATHFINDER RISING</Text>
          <Text style={styles.achievementXP}>Progress: 1000 / 1000 XP</Text>

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Task Card ──────────────────────────────────────────────────────
function TaskCard({ task, onToggle, cinzel }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(task);
  };

  return (
    <Animated.View style={[styles.taskCard, { transform: [{ scale: scaleAnim }] }, task.done && styles.taskCardDone]}>
      {/* Icon */}
      <View style={styles.taskIconWrap}>
        <Text style={styles.taskIcon}>{task.icon || '⚔️'}</Text>
      </View>

      {/* Info */}
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
        <Text style={styles.taskXP}>+{task.xp} XP</Text>
      </View>

      {/* Square checkbox */}
      <TouchableOpacity onPress={handleToggle} style={[styles.squareCheck, task.done && styles.squareCheckDone]}>
        {task.done && <Text style={styles.squareCheckMark}>✓</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({ level: 1, xp: 0, totalXP: 0, username: 'Hunter' });
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('10');
  const [selectedIcon, setSelectedIcon] = useState('⚔️');
  const [questModal, setQuestModal] = useState({ visible: false, task: null });
  const [levelUpModal, setLevelUpModal] = useState({ visible: false, from: 1, to: 2 });

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      setTasks(stored ? JSON.parse(stored) : DEFAULT_TASKS);
      if (!stored) await AsyncStorage.setItem('tasks', JSON.stringify(DEFAULT_TASKS));
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
    } catch {}
  };

  const saveTasks = async (updated) => {
    setTasks(updated);
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const toggleTask = async (task) => {
    if (task.done) return; // can't uncheck
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: true } : t);
    await saveTasks(updated);

    // Show quest completed popup
    setQuestModal({ visible: true, task });

    // Add XP
    const user = await AsyncStorage.getItem('user_data');
    const u = user ? JSON.parse(user) : { level: 1, xp: 0, totalXP: 0 };
    const prevLevel = u.level || 1;
    u.totalXP = (u.totalXP || 0) + task.xp;
    u.xp = (u.xp || 0) + task.xp;

    // Check if all tasks done → level up
    const allDone = updated.every(t => t.done);
    if (allDone) {
      u.level = prevLevel + 1;
      u.xp = 0;
      await AsyncStorage.setItem('user_data', JSON.stringify(u));
      setUserData(u);
      // Show level up after quest modal closes
      setTimeout(() => {
        setQuestModal({ visible: false, task: null });
        setLevelUpModal({ visible: true, from: prevLevel, to: prevLevel + 1 });
      }, 2000);
    } else {
      u.level = Math.max(prevLevel, Math.floor(u.totalXP / 500) + 1);
      await AsyncStorage.setItem('user_data', JSON.stringify(u));
      setUserData(u);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      xp: parseInt(newXP) || 10,
      done: false,
      icon: selectedIcon,
    };
    const updated = [...tasks, task];
    await saveTasks(updated);
    setNewTask('');
    setNewXP('10');
    setSelectedIcon('⚔️');
    setModalVisible(false);
  };

  const handleLevelUpContinue = async () => {
    setLevelUpModal({ visible: false, from: 1, to: 2 });
    // Reset tasks for new day
    const fresh = tasks.map(t => ({ ...t, done: false }));
    await saveTasks(fresh);
  };

  const level = userData.level || 1;
  const totalXP = userData.totalXP || 0;
  const xpInLevel = totalXP % 500;
  const xpProgress = xpInLevel / 500;
  const completed = tasks.filter(t => t.done).length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.appName, { fontFamily: cinzelBold }]}>ARISE</Text>
        </View>

        {/* Level bar */}
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <View style={styles.levelBarBg}>
            <View style={[styles.levelBarFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.levelXP}>{xpInLevel} / 500 XP</Text>
        </View>

        {/* Today's Quests heading */}
        <Text style={[styles.sectionTitle, { fontFamily: cinzelBold }]}>Today's Quests</Text>

        {/* Tasks */}
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} cinzel={cinzel} />
        ))}

        {/* New Quest Button */}
        <TouchableOpacity style={styles.newQuestBtn} onPress={() => setModalVisible(true)}>
          <Text style={[styles.newQuestText, { fontFamily: cinzel }]}>+ New Quest</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quest Completed Popup */}
      <QuestCompletedModal
        visible={questModal.visible}
        task={questModal.task}
        onDone={() => setQuestModal({ visible: false, task: null })}
      />

      {/* Level Up Screen */}
      <LevelUpModal
        visible={levelUpModal.visible}
        fromLevel={levelUpModal.from}
        toLevel={levelUpModal.to}
        onContinue={handleLevelUpContinue}
      />

      {/* Add Quest Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.addModalOverlay}>
          <View style={styles.addModalCard}>
            <Text style={[styles.addModalTitle, { fontFamily: cinzelBold }]}>NEW QUEST</Text>

            <TextInput style={styles.addInput} placeholder="Quest name..." placeholderTextColor="#2A3555"
              value={newTask} onChangeText={setNewTask} />
            <TextInput style={styles.addInput} placeholder="XP reward (e.g. 10)" placeholderTextColor="#2A3555"
              value={newXP} onChangeText={setNewXP} keyboardType="numeric" />

            <Text style={[styles.iconLabel, { fontFamily: cinzel }]}>CHOOSE ICON</Text>
            <View style={styles.iconRow}>
              {TASK_ICONS.map(icon => (
                <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)}
                  style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnActive]}>
                  <Text style={styles.iconBtnText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addSubmitBtn} onPress={addTask}>
              <Text style={[styles.addSubmitText, { fontFamily: cinzelBold }]}>ADD QUEST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addCancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.addCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12' },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  topBar: { paddingTop: 56, paddingBottom: 8, alignItems: 'center' },
  appName: { fontSize: 16, color: '#FFFFFF', letterSpacing: 6, opacity: 0.7 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28, paddingHorizontal: 4 },
  levelLabel: { color: '#AAAACC', fontSize: 13, minWidth: 60 },
  levelBarBg: { flex: 1, height: 3, backgroundColor: '#1A1A2E', borderRadius: 2, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: '#7B4FFF', borderRadius: 2 },
  levelXP: { color: '#AAAACC', fontSize: 12, minWidth: 80, textAlign: 'right' },
  sectionTitle: { fontSize: 28, color: '#FFFFFF', marginBottom: 20 },

  // Task Card
  taskCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#12121E', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#1E1E30',
    shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  taskCardDone: { opacity: 0.5, borderColor: '#7B4FFF44' },
  taskIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E35', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  taskIcon: { fontSize: 22 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', marginBottom: 2 },
  taskTitleDone: { color: '#555577', textDecorationLine: 'line-through' },
  taskXP: { color: '#7B4FFF', fontSize: 12, fontWeight: '600' },
  squareCheck: { width: 30, height: 30, borderRadius: 6, borderWidth: 2, borderColor: '#7B4FFF', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  squareCheckDone: { backgroundColor: '#7B4FFF' },
  squareCheckMark: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  // New Quest Button
  newQuestBtn: { borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, backgroundColor: '#12121E' },
  newQuestText: { color: '#FFFFFF', fontSize: 16, letterSpacing: 1 },

  // Quest Completed Modal
  questModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#A78BFF' },
  questModalCard: { backgroundColor: '#12121E', borderRadius: 24, padding: 32, alignItems: 'center', width: width * 0.82, borderWidth: 1, borderColor: '#7B4FFF55', shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30 },
  checkCircleWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, width: 90, height: 90 },
  checkCircleRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#7B4FFF', opacity: 0.5 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1E1E35', borderWidth: 2, borderColor: '#7B4FFF', justifyContent: 'center', alignItems: 'center' },
  checkCircleIcon: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  questCompletedTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 10 },
  questXPEarned: { color: '#A78BFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  questPriority: { color: '#555577', fontSize: 13, marginBottom: 24 },
  doneBtn: { borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, backgroundColor: '#1A1A2E' },
  doneBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  // Level Up Modal
  levelUpOverlay: { flex: 1, backgroundColor: '#07090F', justifyContent: 'center', alignItems: 'center' },
  levelUpGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#4A1FBF', top: height * 0.2 },
  levelUpGlow2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#7B2FFF', top: height * 0.25, opacity: 0.4 },
  levelUpCard: { alignItems: 'center', paddingHorizontal: 40 },
  levelUpTitle: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, textShadowColor: '#7B4FFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30, marginBottom: 24 },
  levelUpRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  levelUpFrom: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  levelUpArrow: { color: '#A78BFF', fontSize: 24 },
  levelUpTo: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  levelUpBarBg: { width: width * 0.7, height: 6, backgroundColor: '#1A1A2E', borderRadius: 3, overflow: 'hidden', marginBottom: 24 },
  levelUpBarFill: { height: '100%', backgroundColor: '#7B4FFF', borderRadius: 3 },
  achievementLabel: { color: '#555577', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  achievementName: { color: '#A78BFF', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  achievementXP: { color: '#555577', fontSize: 13, marginBottom: 48 },
  continueBtn: { borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 60, backgroundColor: '#12121E', shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20 },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Add Modal
  addModalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  addModalCard: { backgroundColor: '#0F0F1C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: '#1E1E30' },
  addModalTitle: { color: '#FFFFFF', fontSize: 13, letterSpacing: 3, marginBottom: 20, textAlign: 'center' },
  addInput: { backgroundColor: '#12121E', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E30', paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, marginBottom: 12 },
  iconLabel: { color: '#7B4FFF', fontSize: 9, letterSpacing: 2.5, marginBottom: 10 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#12121E', borderWidth: 1, borderColor: '#1E1E30', justifyContent: 'center', alignItems: 'center' },
  iconBtnActive: { borderColor: '#7B4FFF', backgroundColor: '#7B4FFF22' },
  iconBtnText: { fontSize: 22 },
  addSubmitBtn: { backgroundColor: '#5B2FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8, shadowColor: '#5B2FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
  addSubmitText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 2.5 },
  addCancelBtn: { alignItems: 'center', paddingVertical: 12 },
  addCancelText: { color: '#555577', fontSize: 14 },
});
