import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function ProgressTracker() {
  const stats = {
    lessonsCompleted: 24,
    totalLessons: 50,
    currentStreak: 7,
    totalHours: 156,
    completionRate: 48,
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Progress Tracker</Text>
      <Text style={styles.subtitle}>Your learning progress at a glance</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{stats.completionRate}% complete</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lessons Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalLessons}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalHours}</Text>
          <Text style={styles.statLabel}>Hours Learned</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.weekRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={[styles.dayCell, i < 5 && styles.dayCellDone]}>
              <Text style={styles.dayLabel}>{day}</Text>
              <View style={[styles.dayDot, i < 5 && styles.dayDotDone]} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  progressBarWrap: { marginBottom: spacing.sm },
  progressBar: { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  progressLabel: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center' },
  dayCellDone: {},
  dayLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  dayDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border },
  dayDotDone: { backgroundColor: colors.success },
});
