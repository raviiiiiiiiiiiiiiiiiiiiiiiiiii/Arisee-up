import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

const { width, height } = Dimensions.get('window');

export default function OfflineScreen({ onRetry }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Logo */}
        <Text style={[styles.logo, { fontFamily: cinzelBold }]}>ARISE</Text>
        <Text style={[styles.logoSub, { fontFamily: cinzel }]}>IT'S TIME TO LEVEL UP</Text>

        {/* Icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="wifi-outline" size={52} color="#7B4FFF" />
            <View style={styles.iconSlash} />
          </View>
        </Animated.View>

        {/* Message */}
        <Text style={[styles.title, { fontFamily: cinzelBold }]}>NO CONNECTION</Text>
        <Text style={[styles.subtitle, { fontFamily: cinzel }]}>
          Turn on internet to{'\n'}access the app
        </Text>
        <Text style={styles.body}>
          The system requires a stable connection.{'\n'}
          Your quest data is waiting, hunter.
        </Text>

        {/* Retry button */}
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={[styles.retryText, { fontFamily: cinzelBold }]}>TRY AGAIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTop: {
    position: 'absolute', top: -80, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#3B1FBF', opacity: 0.25,
  },
  blobBottom: {
    position: 'absolute', bottom: -100, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#1A0F6B', opacity: 0.2,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    fontSize: 32, color: '#FFFFFF',
    letterSpacing: 8, marginBottom: 6,
    textShadowColor: '#7B4FFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoSub: {
    fontSize: 9, color: '#7B4FFF',
    letterSpacing: 4, marginBottom: 56,
  },
  iconWrap: {
    marginBottom: 36,
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#12121E',
    borderWidth: 2, borderColor: '#7B4FFF33',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  iconSlash: {
    position: 'absolute',
    width: 80, height: 3,
    backgroundColor: '#FF4040',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    top: 53, left: 14,
  },
  title: {
    fontSize: 22, color: '#FFFFFF',
    letterSpacing: 3, marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: '#AAAACC',
    textAlign: 'center', lineHeight: 24,
    marginBottom: 12,
  },
  body: {
    fontSize: 12, color: '#555577',
    textAlign: 'center', lineHeight: 20,
    marginBottom: 48,
  },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#7B4FFF',
    borderRadius: 50, paddingVertical: 15,
    paddingHorizontal: 36,
    shadowColor: '#7B4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  retryText: {
    color: '#FFFFFF', fontSize: 13, letterSpacing: 2,
  },
});
