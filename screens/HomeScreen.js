import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const TASK_ICONS = [
  { key: 'run', component: <FontAwesome5 name="running" size={20} color="#A78BFF" /> },
  { key: 'brain', component: <FontAwesome5 name="brain" size={18} color="#A78BFF" /> },
  { key: 'water', component: <Ionicons name="water-outline" size={22} color="#A78BFF" /> },
  { key: 'dumbbell', component: <MaterialCommunityIcons name="dumbbell" size={22} color="#A78BFF" /> },
  { key: 'book', component: <Ionicons name="book-outline" size={22} color="#A78BFF" /> },
  { key: 'target', component: <MaterialCommunityIcons name="target" size={22} color="#A78BFF" /> },
  { key: 'sword', component: <MaterialCommunityIcons name="sword" size={22} color="#A78BFF" /> },
  { key: 'heart', component: <Ionicons name="heart-outline" size={22} color="#A78BFF" /> },
];

const getIconComponent = (key, size = 22, color = '#A78BFF') => {
  switch (key) {
    case 'run': return <FontAwesome5 name="running" size={size} color={color} />;
    case 'brain': return <FontAwesome5 name="brain" size={size - 2} color={color} />;
    case 'water': return <Ionicons name="water-outline" size={size} color={color} />;
    case 'dumbbell': return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
    case 'book': return <Ionicons name="book-outline" size={size} color={color} />;
    case 'target': return <MaterialCommunityIcons name="target" size={size} color={color} />;
    case 'sword': return <MaterialCommunityIcons name="sword" size={size} color={color} />;
    case 'heart': return <Ionicons name="heart-outline" size={size} color={color} />;
    default: return <MaterialCommunityIcons name="sword" size={size} color={color} />;
  }
};

const SL_QUOTES = [
  { quote: "I alone am the honored one.", author: "Sung Jin-Woo" },
  { quote: "Arise. The shadow soldiers answer only to me.", author: "Shadow Monarch" },
  { quote: "From this moment on, I will only look forward.", author: "Sung Jin-Woo" },
  { quote: "The weak don't get to choose.", author: "Sung Jin-Woo" },
  { quote: "Every day you grow stronger. Every day you level up.", author: "System" },
  { quote: "The penalty quest exists for those who refuse to grow.", author: "System" },
];

const DEFAULT_TASKS = [
  { id: '1', title: 'Exercise', xp: 10, done: false, iconKey: 'run' },
  { id: '2', title: 'Study', xp: 10, done: false, iconKey: 'brain' },
  { id: '3', title: 'Hydration', xp: 10, done: false, iconKey: 'water' },
];

// ── Quest Completed Popup ──────────────────────────────────
function QuestCompletedModal({ visible, task, onDone }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      [scaleAnim, fadeAnim, p1, p2, p3].forEach(a => a.setValue(0));
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(p1, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(p2, { toValue: 1, duration: 1500, delay: 200, useNativeDriver: true }),
        Animated.timing(p3, { toValue: 1, duration: 1800, delay: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const mkParticle = (a, x, y) => ({
    opacity: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
    transform: [
      { translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
      { scale: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 0.5] }) },
    ],
  });

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.questOverlay, { opacity: fadeAnim }]}>
        {[[p1,-80,-120],[p2,80,-100],[p3,-40,-150],[p1,100,-80],[p2,-100,-60],[p3,60,-130]].map(([a,x,y],i) => (
          <Animated.View key={i} style={[styles.particle, mkParticle(a,x,y)]} />
        ))}
        <Animated.View style={[styles.questCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.checkCircleWrap}>
            <View style={styles.checkCircleRing} />
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.questTitle}>Quest Completed</Text>
          <View style={styles.xpRow}>
            <Text style={styles.questXP}>+{task.xp} XP Earned</Text>
            <MaterialCommunityIcons name="crystal-ball" size={18} color="#A78BFF" style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.questSub}>{task.title}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Level Up Screen ────────────────────────────────────────
function LevelUpModal({ visible, fromLevel, toLevel, onContinue }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      [fadeAnim, titleAnim, barAnim].forEach(a => a.setValue(0));
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.timing(barAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  const titleScale = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const glowOp = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.luBg}>
        <Animated.View style={[styles.luGradTop, { opacity: glowOp }]} />
        <Animated.View style={[styles.luGradBottom, { opacity: glowOp }]} />
        <View style={styles.luGradMid} />
        <Animated.View style={[styles.luContent, { opacity: fadeAnim }]}>
          <Animated.Text style={[styles.luTitle, { transform: [{ scale: titleScale }] }]}>
            LEVEL UP
          </Animated.Text>
          <View style={styles.luLevelRow}>
            <Text style={styles.luLevelFrom}>Level {fromLevel}</Text>
            <Ionicons name="arrow-forward" size={22} color="#A78BFF" style={{ marginHorizontal: 12 }} />
            <Text style={styles.luLevelTo}>Level {toLevel}</Text>
          </View>
          <View style={styles.luBarBg}>
            <Animated.View style={[styles.luBarFill, { width: barWidth }]} />
          </View>
          <Text style={styles.luAchLabel}>ACHIEVEMENT UNLOCKED:</Text>
          <Text style={styles.luAchName}>PATHFINDER RISING</Text>
          <Text style={styles.luAchXP}>Progress: 1000 / 1000 XP</Text>
          <TouchableOpacity style={styles.luBtn} onPress={onContinue}>
            <Text style={styles.luBtnText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── All Done View ──────────────────────────────────────────
function AllDoneView({ quote, cinzel, cinzelBold }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.allDoneWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.allDoneGlow} />
      <MaterialCommunityIcons name="sword-cross" size={72} color="#7B4FFF" style={{ marginBottom: 16 }} />
      <Text style={[styles.allDoneTitle, { fontFamily: cinzelBold }]}>ALL QUESTS{'\n'}COMPLETE</Text>
      <View style={styles.allDoneCard}>
        <Ionicons name="chatbubble-outline" size={20} color="#7B4FFF" style={{ marginBottom: 8 }} />
        <Text style={[styles.allDoneQuote, { fontFamily: cinzel }]}>"{quote.quote}"</Text>
        <Text style={styles.allDoneAuthor}>— {quote.author}</Text>
      </View>
      <Text style={styles.allDoneNextDay}>New quests unlock tomorrow. Rest, warrior.</Text>
    </Animated.View>
  );
}

// ── Task Card ──────────────────────────────────────────────
function TaskCard({ task, onToggle }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    if (task.done) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(task);
  };

  return (
    <Animated.View style={[styles.taskCard, task.done && styles.taskCardDone, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.taskIconWrap}>
        {getIconComponent(task.iconKey, 22, task.done ? '#555577' : '#A78BFF')}
      </View>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
        <Text style={[styles.taskXP, task.done && { color: '#555577' }]}>+{task.xp} XP</Text>
      </View>
      <TouchableOpacity onPress={handleToggle} style={[styles.squareCheck, task.done && styles.squareCheckDone]}>
        {task.done && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({ level: 1, xp: 0, totalXP: 0 });
  const [allDone, setAllDone] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(SL_QUOTES[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('10');
  const [selectedIconKey, setSelectedIconKey] = useState('sword');
  const [questModal, setQuestModal] = useState({ visible: false, task: null });
  const [levelUpModal, setLevelUpModal] = useState({ visible: false, from: 1, to: 2 });

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const today = getTodayKey();
      const lastDay = await AsyncStorage.getItem('last_task_day');
      let stored = await AsyncStorage.getItem('tasks');
      let taskList = stored ? JSON.parse(stored) : DEFAULT_TASKS;

      if (lastDay && lastDay !== today) {
        taskList = taskList.map(t => ({ ...t, done: false }));
        await AsyncStorage.setItem('tasks', JSON.stringify(taskList));
        await AsyncStorage.setItem('last_task_day', today);
      } else if (!lastDay) {
        await AsyncStorage.setItem('last_task_day', today);
      }
      if (!stored) await AsyncStorage.setItem('tasks', JSON.stringify(taskList));

      setTasks(taskList);
      const isDone = taskList.length > 0 && taskList.every(t => t.done);
      setAllDone(isDone);
      if (isDone) setCurrentQuote(SL_QUOTES[Math.floor(Math.random() * SL_QUOTES.length)]);

      const user = await AsyncStorage.getItem('user_data');
      if (user) setUserData(JSON.parse(user));
    } catch {}
  };

  const saveTasks = async (updated) => {
    setTasks(updated);
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const toggleTask = async (task) => {
    if (task.done) return;
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: true } : t);
    await saveTasks(updated);
    setQuestModal({ visible: true, task });

    const user = await AsyncStorage.getItem('user_data');
    const u = user ? JSON.parse(user) : { level: 1, xp: 0, totalXP: 0 };
    const prevLevel = u.level || 1;
    u.totalXP = (u.totalXP || 0) + task.xp;
    u.xp = (u.xp || 0) + task.xp;

    const allCompleted = updated.every(t => t.done);
    if (allCompleted) {
      const newLevel = prevLevel + 1;
      u.level = newLevel;
      u.xp = 0;
      u.streak = (u.streak || 0) + 1;
      await AsyncStorage.setItem('user_data', JSON.stringify(u));
      setUserData(u);
      setAllDone(true);
      setCurrentQuote(SL_QUOTES[Math.floor(Math.random() * SL_QUOTES.length)]);
      setTimeout(() => {
        setQuestModal({ visible: false, task: null });
        setLevelUpModal({ visible: true, from: prevLevel, to: newLevel });
      }, 1800);
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
      iconKey: selectedIconKey,
    };
    const updated = [...tasks, task];
    await saveTasks(updated);
    setNewTask(''); setNewXP('10'); setSelectedIconKey('sword');
    setModalVisible(false);
  };

  const level = userData.level || 1;
  const totalXP = userData.totalXP || 0;
  const xpInLevel = totalXP % 500;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.topBar}>
          <Text style={[styles.appName, { fontFamily: cinzelBold }]}>ARISE</Text>
        </View>

        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <View style={styles.levelBarBg}>
            <View style={[styles.levelBarFill, { width: `${(xpInLevel / 500) * 100}%` }]} />
          </View>
          <Text style={styles.levelXP}>{xpInLevel} / 500 XP</Text>
        </View>

        {allDone ? (
          <AllDoneView quote={currentQuote} cinzel={cinzel} cinzelBold={cinzelBold} />
        ) : (
          <>
            <Text style={[styles.sectionTitle, { fontFamily: cinzelBold }]}>Today's Quests</Text>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} />
            ))}
            <TouchableOpacity style={styles.newQuestBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={[styles.newQuestText, { fontFamily: cinzel }]}>New Quest</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <QuestCompletedModal
        visible={questModal.visible}
        task={questModal.task}
        onDone={() => setQuestModal({ visible: false, task: null })}
      />

      <LevelUpModal
        visible={levelUpModal.visible}
        fromLevel={levelUpModal.from}
        toLevel={levelUpModal.to}
        onContinue={() => setLevelUpModal({ visible: false, from: 1, to: 2 })}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.addOverlay}>
          <View style={styles.addCard}>
            <Text style={[styles.addTitle, { fontFamily: cinzelBold }]}>NEW QUEST</Text>
            <TextInput style={styles.addInput} placeholder="Quest name..." placeholderTextColor="#2A3555"
              value={newTask} onChangeText={setNewTask} />
            <TextInput style={styles.addInput} placeholder="XP reward (e.g. 10)" placeholderTextColor="#2A3555"
              value={newXP} onChangeText={setNewXP} keyboardType="numeric" />
            <Text style={[styles.iconSelectLabel, { fontFamily: cinzel }]}>CHOOSE ICON</Text>
            <View style={styles.iconGrid}>
              {TASK_ICONS.map(item => (
                <TouchableOpacity key={item.key} onPress={() => setSelectedIconKey(item.key)}
                  style={[styles.iconBtn, selectedIconKey === item.key && styles.iconBtnActive]}>
                  {React.cloneElement(item.component, { color: selectedIconKey === item.key ? '#FFFFFF' : '#555577' })}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addSubmit} onPress={addTask}>
              <Text style={[styles.addSubmitText, { fontFamily: cinzelBold }]}>ADD QUEST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addCancel} onPress={() => setModalVisible(false)}>
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

  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E1E30', shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  taskCardDone: { opacity: 0.45, borderColor: '#2A2A3A' },
  taskIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E35', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', marginBottom: 2 },
  taskTitleDone: { color: '#555577', textDecorationLine: 'line-through' },
  taskXP: { color: '#7B4FFF', fontSize: 12, fontWeight: '600' },
  squareCheck: { width: 30, height: 30, borderRadius: 6, borderWidth: 2, borderColor: '#7B4FFF', justifyContent: 'center', alignItems: 'center' },
  squareCheckDone: { backgroundColor: '#7B4FFF', borderColor: '#7B4FFF' },

  newQuestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 14, paddingVertical: 16, marginTop: 8, backgroundColor: '#12121E' },
  newQuestText: { color: '#FFFFFF', fontSize: 16, letterSpacing: 1 },

  allDoneWrap: { alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
  allDoneGlow: { position: 'absolute', top: 0, width: 300, height: 300, borderRadius: 150, backgroundColor: '#4A1FBF', opacity: 0.15 },
  allDoneTitle: { fontSize: 24, color: '#FFFFFF', textAlign: 'center', letterSpacing: 3, marginBottom: 32, lineHeight: 36 },
  allDoneCard: { backgroundColor: '#12121E', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#7B4FFF44', width: '100%', marginBottom: 20 },
  allDoneQuote: { color: '#FFFFFF', fontSize: 16, lineHeight: 26, fontStyle: 'italic', marginBottom: 12 },
  allDoneAuthor: { color: '#A78BFF', fontSize: 13, textAlign: 'right' },
  allDoneNextDay: { color: '#555577', fontSize: 13, textAlign: 'center' },

  questOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#A78BFF' },
  questCard: { backgroundColor: '#12121E', borderRadius: 24, padding: 32, alignItems: 'center', width: width * 0.82, borderWidth: 1, borderColor: '#7B4FFF55', shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30 },
  checkCircleWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, width: 90, height: 90 },
  checkCircleRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#7B4FFF', opacity: 0.5 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1E1E35', borderWidth: 2, borderColor: '#7B4FFF', justifyContent: 'center', alignItems: 'center' },
  questTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 10 },
  xpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  questXP: { color: '#A78BFF', fontSize: 16, fontWeight: '700' },
  questSub: { color: '#555577', fontSize: 13, marginBottom: 24 },
  doneBtn: { borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, backgroundColor: '#1A1A2E' },
  doneBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  luBg: { flex: 1, backgroundColor: '#050510', justifyContent: 'center', alignItems: 'center' },
  luGradTop: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5, backgroundColor: '#3B0FA0' },
  luGradBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.5, backgroundColor: '#1A0F6B' },
  luGradMid: { position: 'absolute', top: height * 0.2, left: -100, right: -100, height: height * 0.4, backgroundColor: '#5B0FBF', opacity: 0.15 },
  luContent: { alignItems: 'center', paddingHorizontal: 40 },
  luTitle: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: 6, textShadowColor: '#A78BFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 40, marginBottom: 28 },
  luLevelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  luLevelFrom: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  luLevelTo: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  luBarBg: { width: width * 0.7, height: 6, backgroundColor: '#1A1A2E', borderRadius: 3, overflow: 'hidden', marginBottom: 28 },
  luBarFill: { height: '100%', backgroundColor: '#7B4FFF', borderRadius: 3 },
  luAchLabel: { color: '#555577', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  luAchName: { color: '#A78BFF', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  luAchXP: { color: '#555577', fontSize: 13, marginBottom: 52 },
  luBtn: { borderWidth: 1.5, borderColor: '#7B4FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 60, backgroundColor: '#12121E', shadowColor: '#7B4FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
  luBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  addOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  addCard: { backgroundColor: '#0F0F1C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: '#1E1E30' },
  addTitle: { color: '#FFFFFF', fontSize: 13, letterSpacing: 3, marginBottom: 20, textAlign: 'center' },
  addInput: { backgroundColor: '#12121E', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E30', paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, marginBottom: 12 },
  iconSelectLabel: { color: '#7B4FFF', fontSize: 9, letterSpacing: 2.5, marginBottom: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  iconBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#12121E', borderWidth: 1, borderColor: '#1E1E30', justifyContent: 'center', alignItems: 'center' },
  iconBtnActive: { borderColor: '#7B4FFF', backgroundColor: '#7B4FFF33' },
  addSubmit: { backgroundColor: '#5B2FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  addSubmitText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 2.5 },
  addCancel: { alignItems: 'center', paddingVertical: 12 },
  addCancelText: { color: '#555577', fontSize: 14 },
});
