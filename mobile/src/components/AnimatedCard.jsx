/**
 * Sample integration for animations using react-native-reanimated.
 * Use this pattern for screen transitions, list items, or any animated UI.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const springConfig = { damping: 15, stiffness: 150 };

export default function AnimatedCard({ title, subtitle, delay = 0 }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, springConfig);
      translateY.value = withSpring(0, springConfig);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
}

/**
 * Example: Fade-in loop (e.g. for a pulse hint)
 */
export function FadeInOutBadge({ children }) {
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#000' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
