import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

const { width, height } = Dimensions.get('window');

export default function AuthScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });

  const handleGoogle = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available in the next update.');
  };

  const handleGuest = async () => {
    try {
      const guestData = {
        username: 'Guest Hunter',
        email: 'guest@arise.app',
        level: 1,
        xp: 0,
        totalXP: 0,
        streak: 0,
        isGuest: true,
      };
      await AsyncStorage.setItem('user_data', JSON.stringify(guestData));
      await AsyncStorage.setItem('user_loggedin', 'true');
      navigation.replace('Main');
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient blobs */}
      <Animated.View style={[styles.blobTop, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.blobMid, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.blobBottom, { opacity: glowOpacity }]} />

      {/* Grid lines overlay */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: `${i * 14}%` }]} />
        ))}
      </View>

      {/* Top section - Logo */}
      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={[styles.logoText, { fontFamily: cinzelBold }]}>ARISE</Text>
        <Text style={styles.logoSub}>Rise in real life.</Text>
      </Animated.View>

      {/* Bottom card */}
      <Animated.View style={[
        styles.bottomCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Google Button */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85}>
          <View style={styles.googleIconWrap}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Guest Button */}
        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} activeOpacity={0.85}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestBtnText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By signing in, you agree to our{'\n'}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' & '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
          .
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080812' },

  blobTop: {
    position: 'absolute', top: -100, left: -80,
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: '#3B1FBF',
  },
  blobMid: {
    position: 'absolute', top: height * 0.25, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#5B0FA0',
  },
  blobBottom: {
    position: 'absolute', bottom: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#2A0F8F',
  },

  gridOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
  },
  gridLine: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoText: {
    fontSize: 56,
    color: '#FFFFFF',
    letterSpacing: 12,
    textShadowColor: '#A78BFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 12,
    letterSpacing: 1,
  },

  bottomCard: {
    backgroundColor: 'rgba(15, 12, 30, 0.85)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: 'rgba(123, 79, 255, 0.3)',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#7B4FFF',
    marginBottom: 14,
    shadowColor: '#7B4FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  googleIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  googleG: {
    fontSize: 16, fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '600',
  },

  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4, marginBottom: 14,
  },

  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 24,
  },
  guestIcon: { fontSize: 20, marginRight: 12 },
  guestBtnText: {
    color: 'rgba(255,255,255,0.7)', fontSize: 16,
  },

  termsText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#A78BFF',
  },
});
