import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import FormattedMessage from '../components/FormattedMessage';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function Questionnaire() {
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState('');
  const [engine, setEngine] = useState('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      try {
        setIsLoadingHistory(true);
        const response = await axiosInstance.get('/chat');
        if (response.data.success) {
          const formatted = response.data.messages.map((msg) => ({
            id: msg.id,
            sender: msg.sender === 'bot' ? 'ai' : msg.sender,
            message: msg.message,
            timestamp: msg.created_at,
          }));
          setChatHistory(formatted);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadChatHistory();
  }, [user]);

  const clearChatHistory = () => {
    Alert.alert(
      'Clear chat history?',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete('/chat');
              setChatHistory([]);
              setError('');
            } catch (err) {
              setError('Failed to clear chat history.');
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: question,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);
    setError('');

    try {
      await axiosInstance.post('/chat', { sender: 'user', message: question });

      const response = await axiosInstance.post('/ai/chat', { message: question, engine });

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: response.data.reply,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, aiMessage]);

      await axiosInstance.post('/chat', { sender: 'bot', message: response.data.reply });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        {!isUser && (
          <View style={styles.avatarAi}>
            <Text style={styles.avatarAiText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          {isUser ? (
            <Text style={styles.bubbleUserText}>{item.message}</Text>
          ) : (
            <FormattedMessage message={item.message} />
          )}
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <Text style={styles.avatarUserText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoadingHistory) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Career AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              Ask me anything about your career!{chatHistory.length > 0 ? ` (${chatHistory.length} messages)` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {chatHistory.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearChatHistory}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {chatHistory.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>💬</Text>
          </View>
          <Text style={styles.emptyTitle}>Start Your Career Journey</Text>
          <Text style={styles.emptySubtitle}>
            Tell me about your career interests and goals! I can help you create a personalized roadmap.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask me anything about your career..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={2000}
          editable={!isLoading}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!question.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!question.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerIconText: { fontSize: 18 },
  headerTitle: { fontWeight: '700', color: colors.text, fontSize: 16 },
  headerSubtitle: { fontSize: 12, color: colors.textSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  clearBtn: { backgroundColor: colors.error, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  clearBtnText: { color: '#fff', fontSize: 12 },
  errorBox: { backgroundColor: '#fef2f2', padding: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.sm, borderRadius: borderRadius.sm },
  errorText: { color: colors.error, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyIconText: { fontSize: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
  listContent: { padding: spacing.md, paddingBottom: spacing.lg },
  messageRow: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAi: { justifyContent: 'flex-start' },
  avatarAi: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarAiText: { fontSize: 16 },
  avatarUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  avatarUserText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: borderRadius.lg },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleAi: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleUserText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: '600' },
});
