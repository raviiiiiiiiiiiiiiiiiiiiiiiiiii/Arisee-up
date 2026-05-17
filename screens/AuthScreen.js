import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('ARISE', 'Fill in all fields, hunter.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        // Check stored user
        const stored = await AsyncStorage.getItem('user_data');
        if (!stored) { Alert.alert('No account found. Create one first.'); setLoading(false); return; }
        const user = JSON.parse(stored);
        if (user.email !== email || user.password !== password) {
          Alert.alert('SYSTEM', 'Wrong credentials, hunter.'); setLoading(false); return;
        }
      } else {
        // Register
        const userData = { email, password, username: username || 'Hunter', level: 1, xp: 0, totalXP: 0, streak: 0 };
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      }
      await AsyncStorage.setItem('user_loggedin', 'true');
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowTop, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowBottom, { opacity: glowOpacity }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.logoText, { fontFamily: cinzelBold }]}>ARISE</Text>
            <Text style={[styles.logoSub, { fontFamily: cinzel }]}>IT'S TIME TO LEVEL UP</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.cardTitle, { fontFamily: cinzel }]}>
              {isLogin ? 'ENTER THE GATE' : 'BEGIN YOUR JOURNEY'}
            </Text>

            {!isLogin && (
              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { fontFamily: cinzel }]}>HUNTER NAME</Text>
                <TextInput style={styles.input} placeholder="Your name..." placeholderTextColor="#2A3555"
                  value={username} onChangeText={setUsername} autoCapitalize="none" />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { fontFamily: cinzel }]}>E-MAIL</Text>
              <TextInput style={styles.input} placeholder="hunter@arise.com" placeholderTextColor="#2A3555"
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { fontFamily: cinzel }]}>PASSWORD</Text>
              <View style={styles.passRow}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor="#2A3555"
                  value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit} activeOpacity={0.85}
            >
              <Text style={[styles.submitText, { fontFamily: cinzelBold }]}>
                {loading ? 'AWAKENING...' : isLogin ? 'LOG IN' : 'ARISE'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already a hunter? '}
                <Text style={[styles.switchHighlight, { fontFamily: cinzelBold }]}>
                  {isLogin ? 'Create →' : 'Log in →'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090F' },
  glowTop: { position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#3B1FBF' },
  glowBottom: { position: 'absolute', bottom: -100, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: '#1A0F6B' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 60 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 40, color: '#FFFFFF', letterSpacing: 8, textShadowColor: '#7B4FFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24 },
  logoSub: { fontSize: 10, color: '#7B4FFF', letterSpacing: 4, marginTop: 8 },
  card: { backgroundColor: '#0C0F1E', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: '#1A1F35' },
  cardTitle: { color: '#FFFFFF', fontSize: 13, letterSpacing: 3, marginBottom: 28, textAlign: 'center' },
  inputWrap: { marginBottom: 16 },
  inputLabel: { color: '#7B4FFF', fontSize: 9, letterSpacing: 3, marginBottom: 8 },
  input: { backgroundColor: '#10142A', borderRadius: 12, borderWidth: 1, borderColor: '#1A1F35', paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  eyeText: { fontSize: 18 },
  submitBtn: { backgroundColor: '#5B2FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#5B2FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  submitText: { color: '#FFFFFF', fontSize: 13, letterSpacing: 3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1A1F35' },
  dividerText: { color: '#2A3555', marginHorizontal: 12, fontSize: 12 },
  switchBtn: { alignItems: 'center' },
  switchText: { color: '#2A3555', fontSize: 13 },
  switchHighlight: { color: '#A78BFF' },
});
