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

  const t = theme;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.logoText, { fontFamily: cinzelBold, color: t.text }]}>ARISE UP</Text>
            <Text style={[styles.logoSub, { fontFamily: cinzel }]}>IT'S TIME TO LEVEL UP</Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.subtitle, { color: t.text }]}>
              {isLogin ? 'Log in to your account below.' : 'Create your account below.'}
            </Text>

            {/* Username (signup only) */}
            {!isLogin && (
              <TextInput
                style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.text }]}
                placeholder="Hunter name"
                placeholderTextColor={t.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}

            {/* Email */}
            <TextInput
              style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.text }]}
              placeholder="E-mail address"
              placeholderTextColor={t.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
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

            {/* Forgot + Login row */}
            <View style={styles.loginRow}>
              {isLogin && (
                <TouchableOpacity>
                  <Text style={[styles.forgotText, { color: t.textMuted }]}>Forgot password?</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>{loading ? 'Loading...' : isLogin ? 'Log in' : 'Sign up'}</Text>
              </TouchableOpacity>
            </View>

            {/* Create account row */}
            <TouchableOpacity
              style={[styles.createRow, { backgroundColor: t.card, borderColor: t.cardBorder }]}
              onPress={() => { triggerHaptic('light'); setIsLogin(!isLogin); }}
            >
              <Text style={[styles.createText, { color: t.textSub }]}>
                {isLogin ? "You don't have an account?" : 'Already have an account?'}
              </Text>
              <Text style={[styles.createLink, { color: t.accent }]}>
                {isLogin ? ' Create ›' : ' Log in ›'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: t.cardBorder }]} />
              <Text style={[styles.dividerText, { color: t.textMuted }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: t.cardBorder }]} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => { triggerHaptic('light'); Alert.alert('Coming Soon', 'Google Sign-In in next update.'); }}
              >
                <Text style={styles.googleG}>G</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guestBtn, { backgroundColor: t.card, borderColor: t.cardBorder }]}
                onPress={handleGuest}
              >
                <Ionicons name="person-outline" size={18} color={t.textSub} style={{ marginRight: 8 }} />
                <Text style={[styles.guestText, { color: t.textSub }]}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 60 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoText: { fontSize: 36, letterSpacing: 4, textShadowColor: '#7B4FFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  logoSub: { fontSize: 10, color: '#7B4FFF', letterSpacing: 4, marginTop: 8 },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 24, textAlign: 'center' },
  input: {
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 18,
    paddingVertical: 16, fontSize: 15, marginBottom: 14,
  },
  passWrap: {
    borderRadius: 14, borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', marginBottom: 14, paddingHorizontal: 18,
  },
  passInput: { flex: 1, paddingVertical: 16, fontSize: 15 },
  eyeBtn: { padding: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  forgotText: { fontSize: 13 },
  loginBtn: {
    backgroundColor: '#29B6F6', borderRadius: 50,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  createRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1, padding: 16, marginBottom: 24,
  },
  createText: { fontSize: 14 },
  createLink: { fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  googleG: { fontSize: 22, fontWeight: '900', color: '#4285F4' },
  guestBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, borderWidth: 1, paddingVertical: 14,
  },
  guestText: { fontSize: 14, fontWeight: '500' },
});
