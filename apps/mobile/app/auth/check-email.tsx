import { YStack, Text, Theme } from 'tamagui';

export default function CheckEmailScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space>
        <Text fontSize="$8" fontWeight="bold">
          Check your email
        </Text>
        <Text fontSize="$4" color="$gray11" textAlign="center">
          We've sent you a magic link to sign in to your account. Please check your email and click the link.
        </Text>
      </YStack>
    </Theme>
  );
} 