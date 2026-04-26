import { Redirect } from 'expo-router';

export default function Index() {
  // This instantly teleports the user into the bottom tab navigator
  return <Redirect href="/(tabs)" />;
}