import { YStack, Text, Button, Theme } from 'tamagui';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space>
        <Text fontSize="$8" fontWeight="bold">
          Welcome to Deepread
        </Text>
        <Text fontSize="$4" color="$gray11">
          You're signed in!
        </Text>
        
        <Button
          size="$4"
          width="100%"
          theme="active"
          onPress={signOut}
        >
          Sign Out
        </Button>
      </YStack>
    </Theme>
  );
} 