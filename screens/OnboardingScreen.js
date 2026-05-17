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
    image: 'https://res.cloudinary.com/dieq3fjuv/image/upload/v1779041955/file_00000000db2472089641b89ca3bb767d_ld3f1a.png',
    title: 'Are you ready\nto lock in?',
    warning: 'WARNING — You\'ve seen the path ahead. Choose to walk it, or remain where you are.',
    type: 'hold',
  },
  {
    id: 2,
    image: 'https://res.cloudinary.com/dieq3fjuv/image/upload/v1779041955/file_000000004cc8720894ffeb41edd84feb_bmnusk.png',
    title: 'Are you willing to challenge your own limits to grow?',
    type: 'yesno',
  },
  {
    id: 3,
    image: 'https://res.cloudinary.com/dieq3fjuv/image/upload/v1779041957/file_00000000c6ac72088f7011d77ee9995c_oqow1o.png',
    title: 'Would you invest in yourself if you knew it could change your life?',
    type: 'yesno',
  },
  {
    id: 4,
    image: 'https://res.cloudinary.com/dieq3fjuv/image/upload/v1779041956/file_0000000099f47208ad12dd49f5930464_olgwyo.png',
    title: 'Do you believe that small changes can lead to big transformations?',
    type: 'yesno',
    last: true,
  },
];

function HoldButton({ onComplete }) {
  const progress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);
  const holdAnim = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startHold = () => {
    setHolding(true);
    Animated.timing(scaleAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }).start();
    holdAnim.current = Animated.timing(progress, {
      toValue: 1, duration: 2000, useNativeDriver: false,
    });
    holdAnim.current.start(({ finished }) => {
      if (finished) onComplete();
    });
  };

  const endHold = () => {
    setHolding(false);
    Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    if (holdAnim.current) holdAnim.current.stop();
    Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const circumference = 2 * Math.PI * 42;
  const strokeDash = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View style={[styles.holdWrap, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.holdGlow, { opacity: glowOpacity }]} />
      <TouchableOpacity
        onPressIn={startHold}
        onPressOut={endHold}
        activeOpacity={1}
        style={styles.holdBtn}
      >
        <Text style={styles.holdIcon}>👆</Text>
        <Text style={styles.holdText}>HOLD TO{'\n'}LOCK IN</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    CinzelDecorative_400Regular,
    CinzelDecorative_700Bold,
  });

  useEffect(() => {
    animateIn();
  }, [current]);

  const animateIn = () => {
    textAnim.setValue(30);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const goNext = async () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      if (current < SLIDES.length - 1) {
        setCurrent(prev => prev + 1);
      } else {
        finishOnboarding();
      }
    });
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    navigation.replace('Auth');
  };

  const slide = SLIDES[current];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: slide.image }}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Top logo */}
        <View style={styles.topBar}>
          <Text style={[styles.logoText, fontsLoaded && { fontFamily: 'CinzelDecorative_700Bold' }]}>
            ARISE
          </Text>
        </View>

        {/* Content bottom */}
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: textAnim }] }
        ]}>
          <Text style={[
            styles.title,
            fontsLoaded && { fontFamily: 'CinzelDecorative_400Regular' }
          ]}>
            {slide.title}
          </Text>

          {slide.warning && (
            <Text style={styles.warning}>
              <Text style={styles.warningLabel}>WARNING</Text>
              {' — ' + slide.warning.replace('WARNING — ', '')}
            </Text>
          )}

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
            ))}
          </View>

          {slide.type === 'hold' ? (
            <HoldButton onComplete={goNext} />
          ) : (
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.noBtn} onPress={goNext}>
                <Text style={[styles.noBtnText, fontsLoaded && { fontFamily: 'CinzelDecorative_400Regular' }]}>
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={goNext}>
                <Text style={[styles.yesBtnText, fontsLoaded && { fontFamily: 'CinzelDecorative_700Bold' }]}>
                  {slide.last ? 'ARISE' : 'Yes'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topBar: {
    paddingTop: 60,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: '#7B4FFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 38,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  warning: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
  },
  warningLabel: {
    color: '#FF4D4D',
    fontWeight: '800',
    fontSize: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 40,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  noBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  noBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  yesBtn: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  yesBtnText: {
    color: '#000000',
    fontSize: 16,
    letterSpacing: 2,
  },
  holdWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  holdGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A2FFF',
    top: -10,
  },
  holdBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdIcon: { fontSize: 28, marginBottom: 4 },
  holdText: {
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
    fontWeight: '700',
  },
});
