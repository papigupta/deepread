import { Tabs as ExpoTabs } from 'expo-router/tabs';
import { useTheme } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <ExpoTabs
      screenOptions={{
        tabBarActiveTintColor: theme?.color?.val ?? '#000',
        tabBarInactiveTintColor: theme?.gray11?.val ?? '#666',
        headerShown: false,
      }}
    >
      <ExpoTabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <ExpoTabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="brain" color={color} />,
        }}
      />
      <ExpoTabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <ExpoTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </ExpoTabs>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={24} style={{ marginBottom: -3 }} {...props} />;
} 