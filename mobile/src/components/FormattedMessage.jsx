import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FormattedMessage({ message }) {
  const formatMessage = (text) => {
    if (!text) return [];

    const paragraphs = text.split('\n\n').filter((p) => p.trim());
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();

      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+/)[0];
        const rest = trimmed.replace(/^\d+\.\s/, '');
        return (
          <View key={index} style={styles.listRow}>
            <Text style={styles.bullet}>{num}.</Text>
            <Text style={styles.paragraph}>{rest}</Text>
          </View>
        );
      }

      if (/^[-*•]\s/.test(trimmed)) {
        const rest = trimmed.replace(/^[-*•]\s/, '');
        return (
          <View key={index} style={styles.listRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.paragraph}>{rest}</Text>
          </View>
        );
      }

      if (/^\*\*.*\*\*$/.test(trimmed) || /^##\s/.test(trimmed)) {
        const headerText = trimmed.replace(/^\*\*|\*\*$/g, '').replace(/^##\s/, '');
        return (
          <Text key={index} style={styles.header}>
            {headerText}
          </Text>
        );
      }

      if (/^###\s/.test(trimmed)) {
        const sub = trimmed.replace(/^###\s/, '');
        return (
          <Text key={index} style={styles.subheader}>
            {sub}
          </Text>
        );
      }

      if (/\*\*.*\*\*/.test(trimmed)) {
        const parts = trimmed.split(/(\*\*.*?\*\*)/);
        return (
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <Text key={i} style={styles.bold}>
                  {part.slice(2, -2)}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }

      return (
        <Text key={index} style={styles.paragraph}>
          {trimmed}
        </Text>
      );
    });
  };

  return <View style={styles.container}>{formatMessage(message)}</View>;
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  paragraph: { fontSize: 14, color: '#1f2937', lineHeight: 22, marginBottom: 6 },
  bullet: { color: '#2563eb', fontWeight: '600', marginRight: 8, minWidth: 20 },
  listRow: { flexDirection: 'row', marginBottom: 6 },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  subheader: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 8, marginBottom: 4 },
  bold: { fontWeight: '700', color: '#111' },
});
