import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

const RESOURCES = [
  { id: '1', title: 'MDN Web Docs', category: 'Documentation', url: 'https://developer.mozilla.org', description: 'Comprehensive web development documentation' },
  { id: '2', title: 'freeCodeCamp', category: 'Learning', url: 'https://freecodecamp.org', description: 'Free coding courses and certifications' },
  { id: '3', title: 'React Documentation', category: 'Documentation', url: 'https://react.dev', description: 'Official React docs and tutorials' },
  { id: '4', title: 'Node.js Guides', category: 'Documentation', url: 'https://nodejs.org', description: 'Node.js official documentation' },
  { id: '5', title: 'GitHub', category: 'Tools', url: 'https://github.com', description: 'Code hosting and collaboration' },
];

export default function Resources() {
  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Resources</Text>
      <Text style={styles.subtitle}>Curated learning resources and documentation</Text>

      {RESOURCES.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.card}
          onPress={() => openLink(r.url)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📚</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{r.category}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.cardDesc}>{r.description}</Text>
          <Text style={styles.cardLink}>Open link →</Text>
        </TouchableOpacity>
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
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 22 },
  cardBadge: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
  cardBadgeText: { color: '#fff', fontSize: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  cardDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  cardLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
