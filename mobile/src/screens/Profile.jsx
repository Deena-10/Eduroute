import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/UI/Button';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const userData = {
    username: user?.name || 'User',
    email: user?.email || 'user@example.com',
    interests: ['Software Development', 'Web Development', 'React', 'Node.js'],
    lessonsCompleted: 24,
    totalLessons: 50,
    currentStreak: 7,
    totalHours: 156,
    skills: [
      { name: 'JavaScript', level: 85, category: 'Programming' },
      { name: 'React', level: 72, category: 'Frontend' },
      { name: 'Node.js', level: 68, category: 'Backend' },
      { name: 'HTML/CSS', level: 90, category: 'Frontend' },
    ],
    achievements: [
      { title: 'First Lesson', description: 'Completed your first lesson', date: '2024-01-15', icon: '🎯' },
      { title: 'Week Warrior', description: '7 days learning streak', date: '2024-01-22', icon: '🔥' },
      { title: 'JavaScript Master', description: 'Completed JavaScript fundamentals', date: '2024-01-28', icon: '⚡' },
    ],
    recentActivity: [
      { action: 'Completed lesson', title: 'React Hooks', time: '2 hours ago' },
      { action: 'Started lesson', title: 'Node.js Basics', time: '1 day ago' },
    ],
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userData.username.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData.username}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
          <View style={styles.interestWrap}>
            {userData.interests.slice(0, 3).map((interest, i) => (
              <View key={i} style={styles.interestChip}>
                <Text style={styles.interestChipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakNumber}>{userData.currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {['overview', 'skills', 'achievements', 'activity'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? 'Overview' : tab === 'skills' ? 'Skills' : tab === 'achievements' ? 'Achievements' : 'Activity'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userData.lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${(userData.lessonsCompleted / userData.totalLessons) * 100}%` }]}
                />
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userData.totalHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userData.skills.length}</Text>
              <Text style={styles.statLabel}>Skills</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'skills' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skills Analytics</Text>
          {userData.skills.map((skill, i) => (
            <View key={i} style={styles.skillRow}>
              <View style={styles.skillRowHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillCategory}>{skill.category}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${skill.level}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={styles.skillLevel}>{skill.level}%</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'achievements' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          {userData.achievements.map((a, i) => (
            <View key={i} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{a.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{a.title}</Text>
                <Text style={styles.achievementDesc}>{a.description}</Text>
                <Text style={styles.achievementDate}>{a.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'activity' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {userData.recentActivity.map((a, i) => (
            <View key={i} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>{a.action.includes('Completed') ? '✅' : '🚀'}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{a.action}</Text>
                <Text style={styles.activityTitle}>{a.title}</Text>
              </View>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          ))}
        </View>
      )}

      <Button variant="outlined" onPress={logout} style={styles.logoutBtn}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2, backgroundColor: colors.background },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 2 },
  profileEmail: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  interestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  interestChip: { backgroundColor: '#dbeafe', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  interestChipText: { fontSize: 12, color: colors.primary },
  streakBox: { alignItems: 'center' },
  streakNumber: { fontSize: 24, fontWeight: '700', color: colors.primary },
  streakLabel: { fontSize: 12, color: colors.textSecondary },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '500', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, width: '100%', marginTop: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  skillRow: { marginBottom: spacing.md },
  skillRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  skillName: { fontWeight: '600', color: colors.text },
  skillCategory: { fontSize: 12, color: colors.textSecondary },
  skillLevel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  achievementItem: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-start' },
  achievementIcon: { fontSize: 28, marginRight: spacing.md },
  achievementContent: { flex: 1 },
  achievementTitle: { fontWeight: '600', color: colors.text, marginBottom: 2 },
  achievementDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  achievementDate: { fontSize: 12, color: colors.textSecondary },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  activityContent: { flex: 1 },
  activityAction: { fontWeight: '500', color: colors.text },
  activityTitle: { fontSize: 14, color: colors.textSecondary },
  activityTime: { fontSize: 12, color: colors.textSecondary },
  logoutBtn: { marginTop: spacing.md },
});
