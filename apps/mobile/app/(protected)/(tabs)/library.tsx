import { YStack, Text, Theme } from 'tamagui';

export default function LibraryScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text fontSize="$8" fontWeight="bold">
          Library
        </Text>
        <Text fontSize="$4" color="$gray11">
          Your books will appear here
        </Text>
      </YStack>
    </Theme>
  );
} 