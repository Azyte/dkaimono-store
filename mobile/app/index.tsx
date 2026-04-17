import { Redirect } from 'expo-router';

export default function Index() {
  // Directly route users to the tabs layout where the main app lives
  return <Redirect href="/(tabs)" />;
}
