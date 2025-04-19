import { useState } from 'react';
import { YStack, Text, Input, Button, Theme } from 'tamagui';
import { useRouter } from 'expo-router/hooks';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendMagicLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'deepread://auth/check-email',
        },
      });

      if (error) throw error;
      
      // Show success UI
      router.push('/auth/check-email');
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space>
        <Text fontSize="$8" fontWeight="bold">
          Welcome to Deepread
        </Text>
        <Text fontSize="$4" color="$gray11">
          Continue with your email
        </Text>
        
        <Input
          size="$4"
          width="100%"
          placeholder="Enter your email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Button
          size="$4"
          width="100%"
          theme="active"
          onPress={sendMagicLink}
          disabled={loading || !email}
        >
          {loading ? 'Sending...' : 'Continue with Email'}
        </Button>
      </YStack>
    </Theme>
  );
} 