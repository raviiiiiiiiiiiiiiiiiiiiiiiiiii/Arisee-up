import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const AppContext = createContext({});
export const useAppContext = () => useContext(AppContext);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SL_QUOTES_NOTIF = [
  { title: "ARISE", body: "Your daily quests await. The weak rest — hunters rise." },
  { title: "SYSTEM ALERT", body: "Penalty incoming. Complete your quests before midnight." },
  { title: "SHADOW MONARCH", body: "I alone level up. Have you completed your quests today?" },
  { title: "DAILY QUEST RESET", body: "New day. New quests. Arise, hunter." },
  { title: "SYSTEM", body: "Failure to complete the quest will incur an appropriate penalty." },
  { title: "ARISE", body: "Two hours have passed. Are you still grinding, hunter?" },
  { title: "SHADOW ARMY", body: "The shadows grow stronger every hour. Do not fall behind." },
];

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
    requestAndSetupNotifications();
    initUserData();
  }, []);

  const initUserData = async () => {
    try {
      const existing = await AsyncStorage.getItem('user_data');
      if (!existing) {
        await AsyncStorage.setItem('user_data', JSON.stringify({
          username: 'Hunter',
          level: 1, xp: 0, totalXP: 0, streak: 0,
        }));
      }
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const s = await AsyncStorage.getItem('app_settings');
      if (s) {
        const p = JSON.parse(s);
        setDarkMode(p.darkMode ?? true);
        setSoundEnabled(p.soundEffects ?? true);
        setVibrationEnabled(p.vibration ?? true);
        setNotificationsEnabled(p.notifications ?? true);
      }
    } catch {}
  };

  const saveSettings = async (key, value) => {
    try {
      const s = await AsyncStorage.getItem('app_settings');
      const p = s ? JSON.parse(s) : {};
      p[key] = value;
      await AsyncStorage.setItem('app_settings', JSON.stringify(p));
    } catch {}
  };

  // Removed haptics and sound — stubs kept so screens don't break
  const triggerHaptic = async () => {};
  const playSound = async () => {};

  const requestAndSetupNotifications = async () => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "SYSTEM",
          body: "Arise Up notifications are active. The shadow army is watching.",
          sound: true,
        },
        trigger: { seconds: 3 },
      });
      await scheduleEvery2Hours();
    } catch {}
  };

  const scheduleEvery2Hours = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const hours = [8, 10, 12, 14, 16, 18, 20, 22];
      for (let i = 0; i < hours.length; i++) {
        const quote = SL_QUOTES_NOTIF[i % SL_QUOTES_NOTIF.length];
        await Notifications.scheduleNotificationAsync({
          content: { title: quote.title, body: quote.body, sound: true },
          trigger: { hour: hours[i], minute: 0, repeats: true },
        });
      }
    } catch {}
  };

  const cancelNotifications = async () => {
    try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
  };

  const toggleDarkMode = async (val) => { setDarkMode(val); await saveSettings('darkMode', val); };
  const toggleSound = async (val) => { setSoundEnabled(val); await saveSettings('soundEffects', val); };
  const toggleVibration = async (val) => { setVibrationEnabled(val); await saveSettings('vibration', val); };
  const toggleNotifications = async (val) => {
    setNotificationsEnabled(val);
    await saveSettings('notifications', val);
    if (val) await requestAndSetupNotifications();
    else await cancelNotifications();
  };

  const theme = darkMode ? {
    bg: '#0A0A12', card: '#12121E', cardBorder: '#1E1E30',
    text: '#FFFFFF', textSub: '#AAAACC', textMuted: '#555577',
    accent: '#7B4FFF', accentLight: '#A78BFF',
    tabBg: '#0F0F1C', tabBorder: '#1E1E30', inputBg: '#10142A',
    dark: true,
  } : {
    bg: '#F2F2FA', card: '#FFFFFF', cardBorder: '#E0E0EE',
    text: '#111122', textSub: '#444466', textMuted: '#888899',
    accent: '#7B4FFF', accentLight: '#5B2FFF',
    tabBg: '#FFFFFF', tabBorder: '#E0E0EE', inputBg: '#EEEEFF',
    dark: false,
  };

  return (
    <AppContext.Provider value={{
      darkMode, theme,
      soundEnabled, vibrationEnabled, notificationsEnabled,
      toggleDarkMode, toggleSound, toggleVibration, toggleNotifications,
      triggerHaptic, playSound,
    }}>
      {children}
    </AppContext.Provider>
  );
}
