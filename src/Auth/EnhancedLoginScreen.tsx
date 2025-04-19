import React, { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import { supabase } from '../supabase';
import { Card, Heading, TextInput, Button, Label } from '../../components/ui';
import { YStack, XStack, Text, Separator } from 'tamagui';

// Get the correct localhost address based on platform
const getRedirectUrl = () => {
  // Use a scheme that your app can handle
  return 'deepread://login-callback';
};

export default function EnhancedLoginScreen({ setIsAuthenticated, setLoading }) {
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
    <YStack padding="$4" justifyContent="center" alignItems="center" flex={1}>
      <Card width="100%" maxWidth={500} padding="$5">
        <YStack space="$4" alignItems="center">
          <Heading level="1">Welcome to DeepRead</Heading>
          <Text color="$textMuted" fontSize="$3">Continue with your email</Text>
          
          <YStack width="100%" space="$4">
            <TextInput
              placeholder="Enter your email"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Button 
              variant="primary"
              onPress={sendMagicLink}
              disabled={!email || sendingLink}
              isLoading={sendingLink}
              fullWidth
            >
              Continue with Email
            </Button>
          </YStack>
          
          <Separator marginVertical="$4" />
          
          <Text color="$textMuted" fontSize="$3">Paste access token from magic link</Text>
          
          <YStack width="100%" space="$4">
            <TextInput
              placeholder="access_token=eyJxx..."
              autoCapitalize="none"
              value={accessToken}
              onChangeText={setAccessToken}
              multiline={true}
              numberOfLines={3}
              height={100}
            />
            
            <Button
              variant="secondary"
              onPress={signInWithToken}
              disabled={!accessToken.trim()}
              fullWidth
            >
              Sign In With Token
            </Button>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
} 