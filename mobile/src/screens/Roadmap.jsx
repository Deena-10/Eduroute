import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

const careerPaths = {
  'software-development': {
    title: 'Software Development',
    description: 'Full-stack development path with modern technologies',
    duration: '12 months',
    difficulty: 'Beginner to Advanced',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Database', 'DevOps'],
    steps: [
      {
        phase: 'Foundation',
        duration: '3 months',
        skills: ['HTML/CSS', 'JavaScript', 'Git', 'Command Line'],
        resources: ['MDN Web Docs', 'freeCodeCamp', 'GitHub'],
        projects: ['Personal Portfolio', 'Todo App', 'Calculator'],
      },
      {
        phase: 'Frontend Development',
        duration: '3 months',
        skills: ['React', 'TypeScript', 'CSS Frameworks', 'State Management'],
        resources: ['React Documentation', 'TypeScript Handbook', 'Tailwind CSS'],
        projects: ['E-commerce Site', 'Social Media App', 'Dashboard'],
      },
      {
        phase: 'Backend Development',
        duration: '3 months',
        skills: ['Node.js', 'Express', 'Databases', 'APIs'],
        resources: ['Node.js Documentation', 'Express Guide', 'MongoDB Atlas'],
        projects: ['REST API', 'Blog Platform', 'Chat Application'],
      },
    ],
  },
  'data-science': {
    title: 'Data Science',
    description: 'Analytics and machine learning career path',
    duration: '10 months',
    difficulty: 'Intermediate to Advanced',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
    steps: [
      { phase: 'Python & Statistics', duration: '2 months', skills: ['Python', 'Pandas', 'NumPy'], resources: [], projects: [] },
      { phase: 'Data Visualization', duration: '2 months', skills: ['Matplotlib', 'Seaborn', 'Plotly'], resources: [], projects: [] },
      { phase: 'Machine Learning', duration: '3 months', skills: ['Scikit-learn', 'TensorFlow'], resources: [], projects: [] },
    ],
  },
  'cybersecurity': {
    title: 'Cybersecurity',
    description: 'Learn ethical hacking and security practices',
    duration: '8 months',
    difficulty: 'Beginner to Intermediate',
    skills: ['Network Security', 'Penetration Testing', 'Cryptography'],
    steps: [
      { phase: 'Security Fundamentals', duration: '2 months', skills: ['Network Basics', 'Linux'], resources: [], projects: [] },
      { phase: 'Penetration Testing', duration: '3 months', skills: ['Kali Linux', 'Metasploit'], resources: [], projects: [] },
    ],
  },
  'ui-ux-design': {
    title: 'UI/UX Design',
    description: 'User experience and interface design',
    duration: '6 months',
    difficulty: 'Beginner to Intermediate',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    steps: [
      { phase: 'Design Fundamentals', duration: '2 months', skills: ['Design Principles', 'Typography'], resources: [], projects: [] },
      { phase: 'User Research', duration: '2 months', skills: ['User Interviews', 'Personas'], resources: [], projects: [] },
    ],
  },
};

export default function Roadmap() {
  const [selectedPath, setSelectedPath] = useState('software-development');
  const currentPath = careerPaths[selectedPath];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Career Roadmaps</Text>
      <Text style={styles.pageSubtitle}>Choose your path and follow a structured learning journey</Text>

      <View style={styles.pathGrid}>
        {Object.entries(careerPaths).map(([key, path]) => (
          <TouchableOpacity
            key={key}
            style={[styles.pathCard, selectedPath === key && styles.pathCardActive]}
            onPress={() => setSelectedPath(key)}
            activeOpacity={0.8}
          >
            <Text style={styles.pathCardTitle}>{path.title}</Text>
            <Text style={styles.pathCardDesc} numberOfLines={2}>{path.description}</Text>
            <View style={styles.pathCardMeta}>
              <Text style={styles.pathCardMetaText}>{path.duration}</Text>
              <Text style={styles.pathCardMetaText}>{path.difficulty}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>{currentPath.title}</Text>
        <Text style={styles.detailDesc}>{currentPath.description}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{currentPath.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Difficulty:</Text>
          <Text style={styles.detailValue}>{currentPath.difficulty}</Text>
        </View>

        <Text style={styles.skillsTitle}>Skills You'll Learn</Text>
        <View style={styles.skillWrap}>
          {currentPath.skills.map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {currentPath.steps.map((step, index) => (
        <View key={index} style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepHeaderText}>
              <Text style={styles.stepPhase}>{step.phase}</Text>
              <View style={styles.stepDurationBadge}>
                <Text style={styles.stepDurationText}>{step.duration}</Text>
              </View>
            </View>
          </View>
          {step.skills?.length > 0 && (
            <>
              <Text style={styles.stepSectionTitle}>Skills</Text>
              {step.skills.map((s, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={styles.stepBullet} />
                  <Text style={styles.stepItemText}>{s}</Text>
                </View>
              ))}
            </>
          )}
          {step.resources?.length > 0 && (
            <>
              <Text style={styles.stepSectionTitle}>Resources</Text>
              {step.resources.map((r, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepBullet, { backgroundColor: colors.success }]} />
                  <Text style={styles.stepItemText}>{r}</Text>
                </View>
              ))}
            </>
          )}
          {step.projects?.length > 0 && (
            <>
              <Text style={styles.stepSectionTitle}>Projects</Text>
              {step.projects.map((p, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepBullet, { backgroundColor: '#7c3aed' }]} />
                  <Text style={styles.stepItemText}>{p}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      ))}

      <View style={styles.ctaCard}>
        <Text style={styles.ctaCardTitle}>Ready to Start Your Journey?</Text>
        <Text style={styles.ctaCardSubtitle}>
          Begin your {currentPath.title.toLowerCase()} journey today
        </Text>
        <TouchableOpacity style={styles.ctaCardBtn} activeOpacity={0.8}>
          <Text style={styles.ctaCardBtnText}>Start Learning</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2, backgroundColor: colors.background },
  pageTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  pathGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pathCard: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pathCardActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  pathCardTitle: { fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  pathCardDesc: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  pathCardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  pathCardMetaText: { fontSize: 11, color: colors.textSecondary },
  detailCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  detailTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  detailDesc: { color: colors.textSecondary, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  detailLabel: { color: colors.textSecondary, fontSize: 14 },
  detailValue: { fontWeight: '600', color: colors.text },
  skillsTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skillChip: { backgroundColor: '#dbeafe', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  skillChipText: { color: colors.primary, fontSize: 12 },
  stepCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  stepHeaderText: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  stepPhase: { fontSize: 18, fontWeight: '700', color: colors.text },
  stepDurationBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
  stepDurationText: { fontSize: 12, color: colors.textSecondary },
  stepSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: spacing.sm },
  stepItemText: { fontSize: 14, color: colors.textSecondary },
  ctaCard: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaCardTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: spacing.sm },
  ctaCardSubtitle: { color: 'rgba(255,255,255,0.9)', marginBottom: spacing.lg },
  ctaCardBtn: { backgroundColor: '#fff', paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md },
  ctaCardBtnText: { color: colors.primary, fontWeight: '600' },
});
