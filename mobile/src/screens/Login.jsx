import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/UI/Button';
import TextField from '../components/UI/TextField';
import { colors, spacing } from '../styles/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleSignIn } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // RootNavigator will switch to MainTabs
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (!result.success) {
        setError(result.message || 'Google sign in failed');
      }
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your career journey</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        <Button onPress={handleSubmit} loading={isLoading} style={styles.button}>
          Sign In
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button variant="outlined" onPress={handleGoogleSignIn} disabled={isLoading}>
          Continue with Google
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
            Sign up here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl * 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.error, textAlign: 'center', fontWeight: '500' },
  button: { marginTop: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.md, color: colors.textSecondary, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, flexWrap: 'wrap' },
  footerText: { color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '600' },
});
