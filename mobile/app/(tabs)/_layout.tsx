import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A0E1A',
        },
        headerTitleStyle: {
          fontWeight: '800',
          color: '#E8E8F0',
        },
        tabBarActiveTintColor: '#A29BFE',
        tabBarInactiveTintColor: '#636E8A',
        tabBarStyle: {
          backgroundColor: '#0A0E1A',
          borderTopWidth: 1,
          borderTopColor: '#2D3154',
          height: 60,
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Store',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
