import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

export default function TradoDashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trado Hub</Text>
        <Button title="Sign Out" onPress={handleSignOut} color="#00A884" />
      </View>
      
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Find what you need.</Text>
        <Text style={styles.bannerSubtitle}>Connect with verified providers globally.</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Ask for Product or Service</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Requests</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Need 500kg of Organic Coffee Beans</Text>
        <Text style={styles.cardMeta}>Posted 2 hours ago • Looking for Supplier</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Looking for Web Development Agency</Text>
        <Text style={styles.cardMeta}>Posted 5 hours ago • Looking for Service</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  banner: {
    backgroundColor: '#00A884',
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#e0ffe8',
    fontSize: 16,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#00A884',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: '#666',
  },
});
