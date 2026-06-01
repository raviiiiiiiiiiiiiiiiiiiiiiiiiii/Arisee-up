import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    image: require('../assets/onboarding/slide1.png'),
    title: 'Are you ready\nto lock in?',
    warning: "You've seen the path ahead. Choose to walk it, or remain where you are.",
    type: 'yesno',
    yesLabel: 'CONTINUE',
    noLabel: 'Not Yet',
  },
  {
    id: 2,
    image: require('../assets/onboarding/slide2.png'),
    title: 'Are you willing to challenge your own limits to grow?',
    type: 'yesno',
    yesLabel: 'Yes',
    noLabel: 'No',
  },
  {
    id: 3,
    image: require('../assets/onboarding/slide3.png'),
    title: 'Would you invest in yourself if you knew it could change your life?',
    type: 'yesno',
    yesLabel: 'Yes',
    noLabel: 'No',
  },
  {
    id: 4,
    image: require('../assets/onboarding/slide4.png'),
    title: 'Do you believe that small changes can lead to big transformations?',
    type: 'yesno',
    yesLabel: 'ARISE',
    noLabel: 'No',
    last: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ CinzelDecorative_400Regular, CinzelDecorative_700Bold });
  const cinzelBold = fontsLoaded ? 'CinzelDecorative_700Bold' : 'System';
  const cinzel = fontsLoaded ? 'CinzelDecorative_400Regular' : 'System';

  useEffect(() => { animateIn(); }, [current]);

  const animateIn = () => {
    textAnim.setValue(30);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (current < SLIDES.length - 1) setCurrent(prev => prev + 1);
      else finishOnboarding();
    });
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    navigation.replace('Main');
  };

  const slide = SLIDES[current];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground source={slide.image} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.topBar}>
          <Text style={[styles.logoText, { fontFamily: cinzelBold }]}>ARISE</Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: textAnim }] }]}>
          <Text style={[styles.title, { fontFamily: cinzel }]}>{slide.title}</Text>

          {slide.warning && (
            <Text style={styles.warning}>
              <Text style={styles.warningLabel}>WARNING</Text>
              {' — '}{slide.warning}
            </Text>
          )}

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.noBtn} onPress={goNext}>
              <Text style={[styles.noBtnText, { fontFamily: cinzel }]}>{slide.noLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesBtn} onPress={goNext}>
              <Text style={[styles.yesBtnText, { fontFamily: cinzelBold }]}>{slide.yesLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  topBar: { paddingTop: 60, alignItems: 'center' },
  logoText: {
    fontSize: 28, color: '#FFFFFF', letterSpacing: 8,
    textShadowColor: '#7B4FFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  content: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 56, paddingTop: 28,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  title: {
    fontSize: 26, color: '#FFFFFF', lineHeight: 36, marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  warning: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18, marginBottom: 22 },
  warningLabel: { color: '#FF4D4D', fontWeight: '800', fontSize: 12 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 24, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 40 },
  btnRow: { flexDirection: 'row', gap: 12 },
  noBtn: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50, paddingVertical: 16, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  noBtnText: { color: 'rgba(255,255,255,0.55)', fontSize: 16 },
  yesBtn: { flex: 2, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  yesBtnText: { color: '#FFFFFF', fontSize: 16, letterSpacing: 2 },
});
