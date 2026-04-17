import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A0E1A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#FAFBFF', // Will be changed based on dark mode context logic later
          }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[slug]" options={{ title: 'Top Up' }} />
        <Stack.Screen name="checkout/[orderId]" options={{ title: 'Checkout' }} />
      </Stack>
    </>
  );
}
