import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

const JOBS = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp',
    location: 'Remote',
    duration: '3 months',
    stipend: '$2000/month',
    skills: ['React', 'JavaScript', 'CSS'],
    type: 'Paid',
  },
  {
    id: '2',
    title: 'Data Science Intern',
    company: 'DataFlow Inc',
    location: 'New York',
    duration: '6 months',
    stipend: '$3000/month',
    skills: ['Python', 'Machine Learning', 'SQL'],
    type: 'Paid',
  },
  {
    id: '3',
    title: 'UX Design Intern',
    company: 'DesignHub',
    location: 'San Francisco',
    duration: '4 months',
    stipend: '$2500/month',
    skills: ['Figma', 'User Research', 'Prototyping'],
    type: 'Paid',
  },
];

export default function Jobs() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Jobs & Internships</Text>
      <Text style={styles.subtitle}>Discover opportunities to accelerate your career</Text>

      {JOBS.map((job) => (
        <View key={job.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>💼</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{job.type}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>Location: {job.location}</Text>
            <Text style={styles.metaText}>Duration: {job.duration}</Text>
            <Text style={styles.metaText}>Stipend: {job.stipend}</Text>
          </View>
          <View style={styles.skillWrap}>
            {job.skills.map((skill, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      ))}
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
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 22 },
  typeBadge: { backgroundColor: colors.success, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: '#fff', fontSize: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  company: { fontSize: 14, color: colors.primary, marginBottom: spacing.sm },
  meta: { marginBottom: spacing.sm },
  metaText: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  skillChipText: { fontSize: 12, color: colors.textSecondary },
  applyBtn: { backgroundColor: colors.success, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '600' },
});
