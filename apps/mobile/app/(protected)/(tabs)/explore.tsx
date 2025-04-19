import { YStack, Text, Theme } from 'tamagui';

export default function ExploreScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text fontSize="$8" fontWeight="bold">
          Explore
        </Text>
        <Text fontSize="$4" color="$gray11">
          Discover new books and insights
        </Text>
      </YStack>
    </Theme>
  );
} 