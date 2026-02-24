import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../styles/theme';

const ITEMS = [
  { key: 'DailyTasks', title: 'Daily Tasks', subtitle: 'Track your daily goals', icon: '✅' },
  { key: 'ProgressTracker', title: 'Progress Tracker', subtitle: 'View learning progress', icon: '📊' },
  { key: 'Resources', title: 'Resources', subtitle: 'Learning resources & docs', icon: '📚' },
  { key: 'Jobs', title: 'Jobs & Internships', subtitle: 'Find opportunities', icon: '💼' },
];

export default function MoreScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.row}
          onPress={() => navigation.navigate(item.key)}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  iconText: { fontSize: 22 },
  textWrap: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  rowSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 18, color: colors.textSecondary },
});
