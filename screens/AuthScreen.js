import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import { useAppContext } from '../context/AppContext';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { triggerHaptic, playSound, theme } = useAppContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  const t = theme;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert('ARISE', 'Fill in all fields, hunter.'); return; }
    triggerHaptic('medium');
    playSound('tap');
    setLoading(true);
    try {
      if (isLogin) {
        const stored = await AsyncStorage.getItem('user_data');
        if (!stored) { Alert.alert('No account found. Create one first.'); setLoading(false); return; }
        const user = JSON.parse(stored);
        if (user.email !== email || user.password !== password) {
          Alert.alert('SYSTEM', 'Wrong credentials, hunter.'); setLoading(false); return;
        }
      } else {
        const userData = { email, password, username: username || 'Hunter', level: 1, xp: 0, totalXP: 0, streak: 0 };
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      }
      await AsyncStorage.setItem('user_loggedin', 'true');
      triggerHaptic('success');
      navigation.replace('Main');
    } catch { Alert.alert('Error', 'Something went wrong.'); }
    setLoading(false);
  };

  const handleGuest = async () => {
    triggerHaptic('light');
    playSound('tap');
    const guestData = { username: 'Guest Hunter', email: 'guest@arise.app', level: 1, xp: 0, totalXP: 0, streak: 0, isGuest: true };
    await AsyncStorage.setItem('user_data', JSON.stringify(guestData));
    await AsyncStorage.setItem('user_loggedin', 'true');
    navigation.replace('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.logoText, { fontFamily: cinzelBold, color: t.text }]}>ARISE UP</Text>
            <Text style={[styles.logoSub, { fontFamily: cinzel }]}>IT'S TIME TO LEVEL UP</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.subtitle, { color: t.text }]}>
              {isLogin ? 'Log in to your account below.' : 'Create your account below.'}
            </Text>

            {!isLogin && (
              <TextInput
                style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.text }]}
                placeholder="Hunter name"
                placeholderTextColor={t.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.text }]}
              placeholder="E-mail address"
              placeholderTextColor={t.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={[styles.passWrap, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <TextInput
                style={[styles.passInput, { color: t.text }]}
                placeholder="Password"
                placeholderTextColor={t.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={t.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Login row */}
            <View style={[styles.actionRow, !isLogin && styles.actionRowSignup]}>
              {isLogin && (
                <TouchableOpacity onPress={() => triggerHaptic('light')}>
                  <Text style={[styles.forgotText, { color: t.textMuted }]}>Forgot password?</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Loading...' : isLogin ? 'Log in' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Switch mode */}
            <TouchableOpacity
              style={[styles.switchRow, { backgroundColor: t.card, borderColor: t.cardBorder }]}
              onPress={() => { triggerHaptic('light'); setIsLogin(!isLogin); }}
            >
              <Text style={[styles.switchText, { color: t.textSub }]}>
                {isLogin ? "You don't have an account?" : 'Already have an account?'}
              </Text>
              <Text style={[styles.switchLink, { color: t.accent }]}>
                {isLogin ? ' Create ›' : ' Log in ›'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={[styles.divLine, { backgroundColor: t.cardBorder }]} />
              <Text style={[styles.divText, { color: t.textMuted }]}>or continue with</Text>
              <View style={[styles.divLine, { backgroundColor: t.cardBorder }]} />
            </View>

            {/* Google button */}
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: t.card, borderColor: t.cardBorder }]}
              onPress={() => { triggerHaptic('light'); Alert.alert('Coming Soon', 'Google Sign-In in next update.'); }}
              activeOpacity={0.8}
            >
              {/* Real Google G icon using colored text segments */}
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={[styles.googleBtnText, { color: t.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Guest button */}
            <TouchableOpacity
              style={[styles.guestBtn, { backgroundColor: t.card, borderColor: t.cardBorder }]}
              onPress={handleGuest}
              activeOpacity={0.8}
            >
              <Ionicons name="person-outline" size={18} color={t.textSub} style={{ marginRight: 10 }} />
              <Text style={[styles.guestBtnText, { color: t.textSub }]}>Continue as Guest</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoText: {
    fontSize: 34, letterSpacing: 4,
    textShadowColor: '#7B4FFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  logoSub: { fontSize: 10, color: '#7B4FFF', letterSpacing: 4, marginTop: 8 },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 24 },
  input: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 15, marginBottom: 12,
  },
  passWrap: {
    borderRadius: 14, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, paddingHorizontal: 18,
  },
  passInput: { flex: 1, paddingVertical: 16, fontSize: 15 },
  eyeBtn: { padding: 4 },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  actionRowSignup: { justifyContent: 'flex-start' },
  forgotText: { fontSize: 13 },
  submitBtn: {
    backgroundColor: '#29B6F6', borderRadius: 50,
    paddingVertical: 13, paddingHorizontal: 28,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    padding: 16, marginBottom: 24,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '700' },
  divRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divLine: { flex: 1, height: 1 },
  divText: { marginHorizontal: 12, fontSize: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 18,
    marginBottom: 12,
  },
  googleIconCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  googleG: { fontSize: 16, fontWeight: '900', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '500' },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  guestBtnText: { fontSize: 15 },
});
