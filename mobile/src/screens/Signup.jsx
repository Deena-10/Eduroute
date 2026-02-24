import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/UI/Button';
import TextField from '../components/UI/TextField';
import { colors, spacing } from '../styles/theme';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, googleSignIn } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        // Navigator switches to Main
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (!result.success) setError(result.message || 'Google sign in failed');
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start your career journey</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextField
            label="Full Name"
            value={formData.name}
            onChangeText={(v) => handleChange('name', v)}
            placeholder="Enter your full name"
          />
          <TextField
            label="Email Address"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="Password"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            placeholder="Create a password"
            secureTextEntry
          />
          <TextField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(v) => handleChange('confirmPassword', v)}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <Button onPress={handleSubmit} loading={isLoading} style={styles.button}>
            Sign Up
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
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Sign in here
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
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
