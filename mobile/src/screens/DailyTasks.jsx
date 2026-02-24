import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

const MOCK_TASKS = [
  { id: '1', title: 'Complete React Hooks lesson', category: 'Learning', done: true },
  { id: '2', title: 'Practice 30 min coding', category: 'Practice', done: false },
  { id: '3', title: 'Review roadmap: Backend phase', category: 'Roadmap', done: false },
  { id: '4', title: 'Apply to 2 internships', category: 'Jobs', done: false },
];

export default function DailyTasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Daily Tasks</Text>
      <Text style={styles.subtitle}>Track your daily goals and learning tasks</Text>

      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskCard, task.done && styles.taskCardDone]}
          onPress={() => toggleTask(task.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
            <View style={styles.taskCategory}>
              <Text style={styles.taskCategoryText}>{task.category}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Completed: {tasks.filter((t) => t.done).length} / {tasks.length}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  taskCardDone: { opacity: 0.8, borderColor: colors.success },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  taskContent: { flex: 1 },
  taskTitle: { fontWeight: '600', color: colors.text, fontSize: 16 },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  taskCategory: { marginTop: 4 },
  taskCategoryText: { fontSize: 12, color: colors.textSecondary },
  stats: { marginTop: spacing.lg },
  statsText: { fontSize: 14, color: colors.textSecondary },
});
