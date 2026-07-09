import { Stack } from 'expo-router';
import { AuthProvider } from '../providers/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="(tabs)" options={{ title: 'Trado' }} />
      </Stack>
    </AuthProvider>
  );
}
