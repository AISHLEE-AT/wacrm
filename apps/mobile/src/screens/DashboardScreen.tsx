import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen({ navigation }: any) {
  const [phone, setPhone] = useState<string | null>('');

  useEffect(() => {
    SecureStore.getItemAsync('user-phone').then(setPhone);
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('user-phone');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SuprO!</Text>
      <Text style={styles.subtitle}>Logged in as +91 {phone}</Text>
      
      <View style={styles.card}>
        <Text style={styles.text}>Your React Native app is now perfectly linked to the Next.js API.</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#10b981', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, marginBottom: 40 },
  text: { color: '#fff', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  logoutButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
