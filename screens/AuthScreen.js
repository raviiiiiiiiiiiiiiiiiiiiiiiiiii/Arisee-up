import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('ARISE', 'Fill in all fields, hunter.');
      return;
    }
    setLoading(true);
    // Simulate auth — replace with your actual API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Main');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Background glow blobs */}
      <Animated.View style={[styles.glowBlob, styles.glowTop, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowBlob, styles.glowBottom, { opacity: glowOpacity }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.logoText}>ARISE UP</Text>
            <Text style={styles.logoSub}>IT'S TIME TO LEVEL UP</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.cardTitle}>
              {isLogin ? 'ENTER THE GATE' : 'BEGIN YOUR JOURNEY'}
            </Text>

            {!isLogin && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>HUNTER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name, hunter..."
                  placeholderTextColor="#3D4F6E"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>E-MAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="hunter@arise.com"
                placeholderTextColor="#3D4F6E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#3D4F6E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
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
                <Text style={styles.switchHighlight}>{isLogin ? 'Create →' : 'Log in →'}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060A12',
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#1A5AFF',
  },
  glowTop: {
    top: -80,
    left: -80,
    opacity: 0.4,
  },
  glowBottom: {
    bottom: -100,
    right: -100,
    opacity: 0.25,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: '#3DA9FC',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoSub: {
    fontSize: 11,
    color: '#3DA9FC',
    letterSpacing: 4,
    marginTop: 6,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0D1526',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1A2A4A',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 28,
    textAlign: 'center',
  },
  inputWrap: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#3DA9FC',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111D35',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2F50',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  forgotText: {
    color: '#3D4F6E',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#1A6FFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1A6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A2A4A',
  },
  dividerText: {
    color: '#3D4F6E',
    marginHorizontal: 12,
    fontSize: 12,
  },
  switchBtn: {
    alignItems: 'center',
  },
  switchText: {
    color: '#3D4F6E',
    fontSize: 13,
  },
  switchHighlight: {
    color: '#3DA9FC',
    fontWeight: '700',
  },
});
