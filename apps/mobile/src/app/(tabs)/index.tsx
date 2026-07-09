import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

export default function TradoDashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trado Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to the Trado Marketplace!</Text>
      
      <View style={styles.content}>
        <Text style={styles.text}>Browse buyers and sellers right from your phone.</Text>
      </View>
      
      <Button title="Sign Out" onPress={handleSignOut} color="#00A884" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
