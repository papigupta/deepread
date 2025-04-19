import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { supabase } from '../supabase';

// Get the correct localhost address based on platform
const getRedirectUrl = () => {
  // Use a scheme that your app can handle
  return 'deepread://login-callback';
};

export default function LoginScreen({ setIsAuthenticated, setLoading }) {
  const [email, setEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Debug function - run once when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("DEBUG - Current session:", data.session ? "ACTIVE" : "NONE", data);
        if (error) console.error("Session check error:", error);
        
        // If we have a session, update auth state
        if (data.session) {
          console.log("DEBUG - Have valid session for:", data.session.user.email);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("DEBUG - Session check exception:", e);
      }
    };
    
    checkSession();
  }, []);
  
  // Function to check for existing session
  const checkForExistingSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Existing session check:", session ? "Found session" : "No session");
      
      if (session) {
        console.log("User is already logged in:", session.user.email);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error checking session:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    try {
      console.log("Sending magic link to:", email);
      setSendingLink(true);
      setLoading(true);
      
      const redirectUrl = getRedirectUrl();
      console.log("OTP options:", {
        emailRedirectTo: redirectUrl,
      });
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      console.log("OTP response data:", data);

      if (error) {
        console.error("OTP error:", error);
        throw error;
      }
      
      console.log("Magic link sent successfully!");
      
      // Show success message with instructions
      Alert.alert(
        "Check your email",
        "We've sent you a magic link. Since deep linking might not be working, you'll need to:\n\n1. Open the email\n2. Click the link\n3. When Supabase shows 'You can close this tab', look for a token in the URL that looks like 'access_token=eyJxx...'\n4. Copy that token\n5. Return here and paste it below",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed")
          }
        ]
      );
    } catch (error) {
      console.error('Error sending magic link:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setSendingLink(false);
      setLoading(false);
    }
  };
  
  // Add manual authentication with token
  const signInWithToken = async () => {
    if (!accessToken.trim()) {
      Alert.alert("Error", "Please enter the access token");
      return;
    }

    try {
      setLoading(true);
      
      // Clean up the token if user pasted the full URL
      let cleanToken = accessToken.trim();
      if (cleanToken.includes('access_token=')) {
        cleanToken = cleanToken.split('access_token=')[1].split('&')[0];
      }
      
      console.log("Using cleaned token:", cleanToken.substring(0, 10) + "...");
      
      // This is the key part - manually setting the session with the token
      const { data, error } = await supabase.auth.setSession({
        access_token: cleanToken,
        refresh_token: '', // We don't have this, but it can work without it
      });
      
      console.log("Manual token auth result:", data);
      
      if (error) {
        console.error("Token auth error:", error);
        throw error;
      }
      
      if (data.session) {
        console.log("Successfully authenticated with token for:", data.session.user.email);
        setIsAuthenticated(true);
      } else {
        throw new Error("No session created");
      }
    } catch (error) {
      console.error("Manual token auth failed:", error);
      Alert.alert("Authentication failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DeepRead</Text>
      <Text style={styles.subtitle}>Continue with your email</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!email || sendingLink) && styles.buttonDisabled
        ]}
        onPress={sendMagicLink}
        disabled={!email || sendingLink}
      >
        <Text style={styles.buttonText}>
          {sendingLink ? 'Sending...' : 'Continue with Email'}
        </Text>
      </TouchableOpacity>
      
      {/* Token input for manual authentication */}
      <Text style={styles.dividerText}>OR</Text>
      <Text style={styles.subtitle}>Paste access token from magic link</Text>
      
      <TextInput
        style={styles.input}
        placeholder="access_token=eyJxx..."
        autoCapitalize="none"
        value={accessToken}
        onChangeText={setAccessToken}
        multiline={true}
        numberOfLines={3}
      />
      
      <TouchableOpacity
        style={[
          styles.button,
          !accessToken.trim() && styles.buttonDisabled
        ]}
        onPress={signInWithToken}
        disabled={!accessToken.trim()}
      >
        <Text style={styles.buttonText}>Sign In With Token</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  dividerText: {
    marginVertical: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 