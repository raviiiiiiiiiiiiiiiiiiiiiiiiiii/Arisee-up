import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Modal, Dimensions, Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

const INITIAL_TASKS = [
  { id: 1, title: '100 Push-ups', xp: 50, done: false, priority: 'S' },
  { id: 2, title: '100 Sit-ups', xp: 50, done: false, priority: 'S' },
  { id: 3, title: '10km Run', xp: 100, done: false, priority: 'A' },
  { id: 4, title: 'Read for 30 minutes', xp: 30, done: true, priority: 'B' },
];

const PRIORITY_COLORS = { S: '#FF4D6D', A: '#FF9F1C', B: '#3DA9FC', C: '#7B61FF' };

function TaskCard({ task, onToggle, onDelete }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.done ? 1 : 0)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    Animated.timing(checkAnim, {
      toValue: task.done ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onToggle(task.id);
  };

  const checkBg = checkAnim.interpolate({ inputRange: [0, 1], outputRange: ['#111D35', '#1A6FFF'] });

  return (
    <Animated.View style={[styles.taskCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + '22' }]}>
        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>
          {task.priority}
        </Text>
      </View>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
        <Text style={styles.taskXP}>+{task.xp} XP</Text>
      </View>

      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
        <Animated.View style={[styles.checkbox, { backgroundColor: checkBg, borderColor: task.done ? '#1A6FFF' : '#1E2F50' }]}>
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('30');
  const [newPriority, setNewPriority] = useState('B');
  const [timeLeft, setTimeLeft] = useState(18 * 3600 + 39 * 60 + 59);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalXP = tasks.filter(t => t.done).reduce((sum, t) => sum + t.xp, 0);
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: newTask.trim(),
      xp: parseInt(newXP) || 30,
      done: false,
      priority: newPriority,
    }]);
    setNewTask('');
    setNewXP('30');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Glow */}
      <View style={styles.glowTop} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View>
            <Text style={styles.greeting}>DAILY QUEST</Text>
            <Text style={styles.subGreeting}>Training to become a great warrior.</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerIcon}>⏱</Text>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </Animated.View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>QUEST PROGRESS</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.statText}>
              <Text style={styles.statHighlight}>{completedCount}</Text>/{tasks.length} tasks
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.statHighlight}>+{totalXP}</Text> XP earned
            </Text>
          </View>
        </View>

        {/* Warning */}
        {timeLeft < 3600 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ WARNING — Complete quest before time expires or face penalty!
            </Text>
          </View>
        )}

        {/* Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GOALS</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ ADD</Text>
          </TouchableOpacity>
        </View>

        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW QUEST TASK</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Task name..."
              placeholderTextColor="#3D4F6E"
              value={newTask}
              onChangeText={setNewTask}
            />

            <View style={styles.modalRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>XP REWARD</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="30"
                  placeholderTextColor="#3D4F6E"
                  value={newXP}
                  onChangeText={setNewXP}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {['S', 'A', 'B', 'C'].map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setNewPriority(p)}
                      style={[
                        styles.priorityBtn,
                        { borderColor: PRIORITY_COLORS[p] },
                        newPriority === p && { backgroundColor: PRIORITY_COLORS[p] + '33' },
                      ]}
                    >
                      <Text style={[styles.priorityBtnText, { color: PRIORITY_COLORS[p] }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalSubmit} onPress={addTask}>
              <Text style={styles.modalSubmitText}>ADD TO QUEST</Text>
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
  container: { flex: 1, backgroundColor: '#060A12' },
  glowTop: {
    position: 'absolute', top: -60, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#1A3FBF', opacity: 0.35,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  subGreeting: { fontSize: 12, color: '#3D4F6E', marginTop: 4, fontStyle: 'italic' },
  timerBadge: {
    backgroundColor: '#0D1526', borderRadius: 12, borderWidth: 1,
    borderColor: '#1E2F50', padding: 10, alignItems: 'center',
  },
  timerIcon: { fontSize: 16 },
  timerText: { color: '#3DA9FC', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  progressCard: {
    backgroundColor: '#0D1526', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1A2A4A', marginBottom: 16,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: '#3D4F6E', fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  progressPercent: { color: '#3DA9FC', fontSize: 14, fontWeight: '800' },
  progressBarBg: { backgroundColor: '#111D35', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#1A6FFF', borderRadius: 6 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { color: '#3D4F6E', fontSize: 12 },
  statHighlight: { color: '#FFFFFF', fontWeight: '700' },
  warningBanner: {
    backgroundColor: '#FF4D6D18', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#FF4D6D55', marginBottom: 16,
  },
  warningText: { color: '#FF4D6D', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  addBtn: {
    backgroundColor: '#1A6FFF22', borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 6, borderWidth: 1, borderColor: '#1A6FFF55',
  },
  addBtnText: { color: '#3DA9FC', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  taskCard: {
    backgroundColor: '#0D1526', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#1A2A4A', marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  priorityBadge: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  priorityText: { fontSize: 13, fontWeight: '900' },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  taskDone: { color: '#3D4F6E', textDecorationLine: 'line-through' },
  taskXP: { color: '#3DA9FC', fontSize: 11, marginTop: 3, fontWeight: '700' },
  checkbox: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  modalOverlay: {
    flex: 1, backgroundColor: '#000000AA',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0D1526', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, borderTopWidth: 1, borderColor: '#1A2A4A',
  },
  modalTitle: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '800',
    letterSpacing: 3, marginBottom: 20, textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#111D35', borderRadius: 12, borderWidth: 1,
    borderColor: '#1E2F50', paddingHorizontal: 16, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15, marginBottom: 14,
  },
  inputLabel: { color: '#3DA9FC', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', marginBottom: 8 },
  modalRow: { flexDirection: 'row', marginBottom: 4 },
  priorityRow: { flexDirection: 'row', gap: 6 },
  priorityBtn: {
    width: 36, height: 42, borderRadius: 8, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  priorityBtnText: { fontSize: 13, fontWeight: '900' },
  modalSubmit: {
    backgroundColor: '#1A6FFF', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
    shadowColor: '#1A6FFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  modalSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 2.5 },
  modalCancel: { alignItems: 'center', paddingVertical: 14 },
  modalCancelText: { color: '#3D4F6E', fontSize: 13 },
});
