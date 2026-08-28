// @ts-nocheck
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Car, Truck, Store, GraduationCap, Wrench, Users, Compass, Shield } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';

const CATEGORIES = [
  { id: 'Traveller', name: 'RideO', label: 'Passenger', icon: Car, color: '#34d399' },
  { id: 'Driver', name: 'DriveO', label: 'Driver', icon: Truck, color: '#38bdf8' },
  { id: 'Student', name: 'TutO', label: 'Student', icon: GraduationCap, color: '#818cf8' },
  { id: 'Farmer', name: 'AgrO & RentO', label: 'Farmer', icon: Wrench, color: '#fbbf24' },
  { id: 'Shopper', name: 'DealO', label: 'Shopper', icon: Store, color: '#f472b6' },
  { id: 'Group', name: 'GroupO', label: 'SHG Member', icon: Users, color: '#c084fc' },
  { id: 'Tourist', name: 'TourO', label: 'Tourist', icon: Compass, color: '#22d3ee' }
];

export default function OnboardingModuleScreen({ navigation }: any) {
  const { user, setUser } = useContext(AppContext);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (categoryId: string) => {
    setLoadingId(categoryId);
    try {
      await SecureStore.setItemAsync('user-role', categoryId); // We use role/category interchangeably for now
      
      // Update in local context instantly
      if (user) {
        setUser({ ...user, category: categoryId });
      }

      if (user?.phone) {
        const clean = user.phone.replace(/\D/g, '').slice(-10);
        await supabase.from('profiles').update({ 
          category: categoryId,
        }).ilike('phone', `%${clean}%`);
      }

      // Navigate instantly to dashboard where bottom tabs will read the new category
      navigation.replace('Dashboard');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to switch module');
      setLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to SuprO</Text>
          <Text style={styles.subtitle}>Select what you need to do right now. You can change this anytime.</Text>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const isLoading = loadingId === cat.id;
            const Icon = cat.icon;
            
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.card, { borderColor: cat.color + '40' }]}
                onPress={() => handleSelect(cat.id)}
                disabled={loadingId !== null}
              >
                {isLoading ? (
                  <ActivityIndicator color={cat.color} size="large" />
                ) : (
                  <>
                    <View style={[styles.iconWrapper, { backgroundColor: cat.color + '20' }]}>
                      <Icon color={cat.color} size={32} />
                    </View>
                    <Text style={[styles.cardText, { color: cat.color }]}>{cat.name}</Text>
                    <Text style={styles.cardLabel}>{cat.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContent: { padding: 20, paddingBottom: 60, paddingTop: 60 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '47%', 
    backgroundColor: '#111827', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 100,
    marginBottom: 12
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
  }
});
