import { YStack, Text, Theme, Button } from 'tamagui';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login' as any);
  };

  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space>
        <Text fontSize="$8" fontWeight="bold">
          Profile
        </Text>
        <Text fontSize="$4" color="$gray11">
          Your profile settings
        </Text>
        <Button 
          size="$4" 
          width="100%" 
          theme="red" 
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </YStack>
    </Theme>
  );
} 