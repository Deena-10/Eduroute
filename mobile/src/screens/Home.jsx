import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../styles/theme';

const roadmaps = [
  {
    id: 1,
    title: 'Software Development',
    description: 'Complete roadmap from beginner to full-stack developer',
    duration: '12 months',
    level: 'Beginner to Advanced',
    skills: ['JavaScript', 'React', 'Node.js', 'Database'],
  },
  {
    id: 2,
    title: 'Data Science',
    description: 'Master data analysis, machine learning, and AI',
    duration: '10 months',
    level: 'Intermediate to Advanced',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow'],
  },
  {
    id: 3,
    title: 'Cybersecurity',
    description: 'Learn ethical hacking and security practices',
    duration: '8 months',
    level: 'Beginner to Intermediate',
    skills: ['Network Security', 'Penetration Testing', 'Cryptography'],
  },
  {
    id: 4,
    title: 'UI/UX Design',
    description: 'Create beautiful and functional user interfaces',
    duration: '6 months',
    level: 'Beginner to Intermediate',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
  },
];

export default function Home() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('roadmaps');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {!isAuthenticated() && (
        <View style={styles.quickAccess}>
          <Text style={styles.quickTitle}>Quick Access</Text>
          <Text style={styles.quickSubtitle}>
            Login to access your personalized career roadmap and AI chat
          </Text>
          <View style={styles.quickButtons}>
            <TouchableOpacity style={styles.quickBtnPrimary} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.quickBtnPrimaryText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtnOutlined} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.quickBtnOutlinedText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.testAccount}>Use your own account credentials to continue.</Text>
        </View>
      )}

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Your Career Journey <Text style={styles.heroTitleAccent}>Starts Here</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Discover personalized career roadmaps, find internships, and connect with opportunities.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.heroBtnPrimary}
            onPress={() => (user ? navigation.navigate('AI') : navigation.navigate('Login'))}
          >
            <Text style={styles.heroBtnText}>Start Your Journey</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnSecondary}
            onPress={() => (user ? navigation.navigate('Roadmap') : navigation.navigate('Login'))}
          >
            <Text style={styles.heroBtnSecondaryText}>Explore Roadmaps</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose EduRoute AI?</Text>
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>AI-Powered Guidance</Text>
          <Text style={styles.featureTitle}>Personalized career advice and roadmap recommendations.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>Structured Learning</Text>
          <Text style={styles.featureTitle}>Clear milestones and progress tracking.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>Career Opportunities</Text>
          <Text style={styles.featureTitle}>Internships, events, and networking opportunities.</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'roadmaps' && styles.tabActive]}
          onPress={() => setActiveTab('roadmaps')}
        >
          <Text style={[styles.tabText, activeTab === 'roadmaps' && styles.tabTextActive]}>
            Career Roadmaps
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'roadmaps' &&
        roadmaps.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.roadmapCard}
            onPress={() => (user ? navigation.navigate('Roadmap') : navigation.navigate('Login'))}
            activeOpacity={0.8}
          >
            <Text style={styles.roadmapTitle}>{r.title}</Text>
            <Text style={styles.roadmapDesc}>{r.description}</Text>
            <View style={styles.roadmapMeta}>
              <Text style={styles.roadmapMetaText}>Duration: {r.duration}</Text>
              <Text style={styles.roadmapMetaText}>Level: {r.level}</Text>
            </View>
            <View style={styles.skillRow}>
              {r.skills.slice(0, 3).map((s, i) => (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{s}</Text>
                </View>
              ))}
            </View>
            <View style={styles.roadmapBtn}>
              <Text style={styles.roadmapBtnText}>Start Learning</Text>
            </View>
          </TouchableOpacity>
        ))}

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Career?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of students and professionals who have discovered their path.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => (user ? navigation.navigate('Profile') : navigation.navigate('Login'))}
        >
          <Text style={styles.ctaButtonText}>{user ? 'View Profile' : 'Get Started Today'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: spacing.xl * 2, backgroundColor: colors.background },
  quickAccess: {
    backgroundColor: '#fbbf24',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  quickTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: spacing.xs },
  quickSubtitle: { color: '#000', marginBottom: spacing.md, opacity: 0.9 },
  quickButtons: { flexDirection: 'row', gap: spacing.md },
  quickBtnPrimary: {
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  quickBtnPrimaryText: { color: '#ea580c', fontWeight: '600' },
  quickBtnOutlined: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  quickBtnOutlinedText: { color: '#fff', fontWeight: '600' },
  testAccount: { fontSize: 12, marginTop: spacing.sm, opacity: 0.9 },
  hero: { padding: spacing.lg, alignItems: 'center' },
  heroTitle: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  heroTitleAccent: { color: colors.primary },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  heroButtons: { gap: spacing.md },
  heroBtnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  heroBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  heroBtnSecondary: {
    backgroundColor: colors.textSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  heroBtnSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  featureCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  featureEmoji: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  featureTitle: { color: colors.textSecondary },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  roadmapCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  roadmapTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  roadmapDesc: { color: colors.textSecondary, marginBottom: spacing.sm },
  roadmapMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  roadmapMetaText: { fontSize: 12, color: colors.textSecondary },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  skillChipText: { fontSize: 12, color: colors.textSecondary },
  roadmapBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  roadmapBtnText: { color: '#fff', fontWeight: '600' },
  cta: { padding: spacing.xl, alignItems: 'center' },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  ctaSubtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  ctaButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
