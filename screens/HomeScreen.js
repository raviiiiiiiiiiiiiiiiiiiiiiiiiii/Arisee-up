import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useFocusEffect } from '@react-navigation/native';

const PRIORITY_COLORS = { S: '#FF4060', A: '#FF9F1C', B: '#A78BFF', C: '#3DA9FC' };

const DEFAULT_TASKS = [
  { id: '1', title: '100 Push-ups', xp: 50, done: false, priority: 'S' },
  { id: '2', title: '10km Run', xp: 100, done: false, priority: 'A' },
  { id: '3', title: 'Read for 30 minutes', xp: 30, done: false, priority: 'B' },
];

function TaskCard({ task, onToggle, onDelete, cinzel, cinzelBold }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  const handleDelete = () => {
    Alert.alert('Delete Quest?', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => onDelete(task.id));
      }},
    ]);
  };

  return (
    <Animated.View style={[styles.taskCard, { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
      task.done && styles.taskCardDone
    ]}>
      <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + '22' }]}>
        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority], fontFamily: cinzelBold }]}>
          {task.priority}
        </Text>
      </View>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, { fontFamily: cinzel }, task.done && styles.taskDone]}>
          {task.title}
        </Text>
        <Text style={styles.taskXP}>+{task.xp} XP</Text>
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}
          style={[styles.checkbox, task.done && styles.checkboxDone]}>
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('30');
  const [newPriority, setNewPriority] = useState('B');
  const [timeLeft, setTimeLeft] = useState(0);
  const [username, setUsername] = useState('Hunter');

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load tasks and user on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // Set timer to end of day
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 0);
    setTimeLeft(Math.floor((endOfDay - now) / 1000));

    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) setTasks(JSON.parse(stored));
      else {
        setTasks(DEFAULT_TASKS);
        await AsyncStorage.setItem('tasks', JSON.stringify(DEFAULT_TASKS));
      }
      const user = await AsyncStorage.getItem('user_data');
      if (user) setUsername(JSON.parse(user).username || 'Hunter');
    } catch {}
  };

  const saveTasks = async (updated) => {
    setTasks(updated);
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const toggleTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    await saveTasks(updated);

    // Update XP
    const task = tasks.find(t => t.id === id);
    if (!task.done) {
      const user = await AsyncStorage.getItem('user_data');
      if (user) {
        const u = JSON.parse(user);
        u.xp = (u.xp || 0) + task.xp;
        u.totalXP = (u.totalXP || 0) + task.xp;
        // Level up every 500 XP
        u.level = Math.floor(u.totalXP / 500) + 1;
        await AsyncStorage.setItem('user_data', JSON.stringify(u));
      }
    }
  };

  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    await saveTasks(updated);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      xp: parseInt(newXP) || 30,
      done: false,
      priority: newPriority,
    };
    const updated = [...tasks, task];
    await saveTasks(updated);
    setNewTask('');
    setNewXP('30');
    setNewPriority('B');
    setModalVisible(false);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const completed = tasks.filter(t => t.done).length;
  const totalXPEarned = tasks.filter(t => t.done).reduce((s, t) => s + t.xp, 0);
  const progress = tasks.length > 0 ? completed / tasks.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View>
            <Text style={[styles.greeting, { fontFamily: cinzelBold }]}>DAILY QUEST</Text>
            <Text style={styles.subGreeting}>Training to become a great warrior, {username}.</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerIcon}>⏱</Text>
            <Text style={[styles.timerText, { fontFamily: cinzelBold }]}>{formatTime(timeLeft)}</Text>
          </View>
        </Animated.View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { fontFamily: cinzel }]}>QUEST PROGRESS</Text>
            <Text style={[styles.progressPercent, { fontFamily: cinzelBold }]}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.statText}><Text style={styles.statHL}>{completed}</Text>/{tasks.length} tasks</Text>
            <Text style={styles.statText}><Text style={styles.statHL}>+{totalXPEarned}</Text> XP earned</Text>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontFamily: cinzelBold }]}>GOALS</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={[styles.addBtnText, { fontFamily: cinzel }]}>+ ADD</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No quests yet. Add your first quest!</Text>
          </View>
        )}

        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask}
            onDelete={deleteTask} cinzel={cinzel} cinzelBold={cinzelBold} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { fontFamily: cinzelBold }]}>NEW QUEST TASK</Text>

            <TextInput style={styles.modalInput} placeholder="Task name..." placeholderTextColor="#2A3555"
              value={newTask} onChangeText={setNewTask} />

            <Text style={[styles.inputLabel, { fontFamily: cinzel }]}>XP REWARD</Text>
            <TextInput style={styles.modalInput} placeholder="30" placeholderTextColor="#2A3555"
              value={newXP} onChangeText={setNewXP} keyboardType="numeric" />

            <Text style={[styles.inputLabel, { fontFamily: cinzel }]}>PRIORITY</Text>
            <View style={styles.priorityRow}>
              {['S', 'A', 'B', 'C'].map(p => (
                <TouchableOpacity key={p} onPress={() => setNewPriority(p)}
                  style={[styles.priorityBtn, { borderColor: PRIORITY_COLORS[p] },
                    newPriority === p && { backgroundColor: PRIORITY_COLORS[p] + '33' }]}>
                  <Text style={[styles.priorityBtnText, { color: PRIORITY_COLORS[p], fontFamily: cinzelBold }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalSubmit} onPress={addTask}>
              <Text style={[styles.modalSubmitText, { fontFamily: cinzelBold }]}>ADD TO QUEST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090F' },
  glowTop: { position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#2A1580', opacity: 0.4 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 18, color: '#FFFFFF', letterSpacing: 2 },
  subGreeting: { fontSize: 11, color: '#3D4060', marginTop: 4, fontStyle: 'italic' },
  timerBadge: { backgroundColor: '#0C0F1E', borderRadius: 12, borderWidth: 1, borderColor: '#1A1F35', padding: 10, alignItems: 'center' },
  timerIcon: { fontSize: 16 },
  timerText: { color: '#A78BFF', fontSize: 12, letterSpacing: 1, marginTop: 2 },
  progressCard: { backgroundColor: '#0C0F1E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1A1F35', marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: '#3D4060', fontSize: 9, letterSpacing: 2 },
  progressPercent: { color: '#A78BFF', fontSize: 14 },
  progressBarBg: { backgroundColor: '#10142A', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#5B2FFF', borderRadius: 6 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { color: '#3D4060', fontSize: 12 },
  statHL: { color: '#FFFFFF', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 11, letterSpacing: 3 },
  addBtn: { backgroundColor: '#A78BFF22', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#A78BFF44' },
  addBtnText: { color: '#A78BFF', fontSize: 9, letterSpacing: 1.5 },
  taskCard: { backgroundColor: '#0C0F1E', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1A1F35', marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  taskCardDone: { borderColor: '#5B2FFF44', backgroundColor: '#0A0D1A' },
  priorityBadge: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  priorityText: { fontSize: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#FFFFFF', fontSize: 14 },
  taskDone: { color: '#2A3555', textDecorationLine: 'line-through' },
  taskXP: { color: '#A78BFF', fontSize: 10, marginTop: 3, fontWeight: '700' },
  taskActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: '#1A1F35', backgroundColor: '#10142A', justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: '#5B2FFF', borderColor: '#5B2FFF' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#2A3555', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0C0F1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: '#1A1F35' },
  modalTitle: { color: '#FFFFFF', fontSize: 13, letterSpacing: 3, marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#10142A', borderRadius: 12, borderWidth: 1, borderColor: '#1A1F35', paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, marginBottom: 14 },
  inputLabel: { color: '#A78BFF', fontSize: 9, letterSpacing: 2.5, marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priorityBtn: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  priorityBtnText: { fontSize: 13 },
  modalSubmit: { backgroundColor: '#5B2FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#5B2FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  modalSubmitText: { color: '#FFFFFF', fontSize: 12, letterSpacing: 2.5 },
  modalCancel: { alignItems: 'center', paddingVertical: 14 },
  modalCancelText: { color: '#2A3555', fontSize: 13 },
});
