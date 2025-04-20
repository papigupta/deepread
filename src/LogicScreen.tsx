import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from './lib/supabaseClient'; // Adjust path if needed

const LoginScreen = ({ setIsAuthenticated, setLoading }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:8081/login-callback',
      },
    });

    setSubmitting(false);
    setLoading(false);

    if (error) {
      Alert.alert('Login error', error.message);
    } else {
      Alert.alert('Magic Link Sent!', 'Check your email to log in.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        title={submitting ? 'Sending...' : 'Continue with Email'}
        onPress={handleLogin}
        disabled={!email || submitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
});

export default LoginScreen;
