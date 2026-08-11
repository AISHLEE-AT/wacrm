// @ts-nocheck
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';

const MODULES = [
  { id: '/rideo', name: 'RideO' },
  { id: '/drivo', name: 'DriveO' },
  { id: '/dealo', name: 'DealO' },
  { id: '/teacho', name: 'TeachO' },
  { id: '/rento', name: 'RentO' },
  { id: '/agro', name: 'AgrO' },
  { id: '/touro', name: 'TourO' },
  { id: '/testo', name: 'TestO' },
  { id: '/tvo', name: 'TvO' },
  { id: '/moneyo', name: 'MoneyO' },
  { id: '/gameo', name: 'GameO' }
];

export default function OnboardingModuleScreen({ navigation }: any) {
  const { user, setSelectedModule } = useContext(AppContext);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!selected) {
      Alert.alert('Selection Required', 'Please select a primary module.');
      return;
    }

    setLoading(true);
    try {
      await SecureStore.setItemAsync('user-selected-module', selected);
      await SecureStore.setItemAsync('onboarding-complete', 'true');
      
      if (user?.phone) {
        await supabase.from('profiles').update({ 
          selected_module: selected,
          onboarding_complete: true
        }).eq('phone', user.phone);
      }

      if (setSelectedModule) {
        setSelectedModule(selected);
      }

      navigation.replace('Dashboard');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Module</Text>
          <Text style={styles.subtitle}>Select the primary service you'll use.</Text>
        </View>

        <View style={styles.grid}>
          {MODULES.map((mod) => {
            const isSelected = selected === mod.id;
            return (
              <TouchableOpacity
                key={mod.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(mod.id)}
              >
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>{mod.name}</Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <CheckCircle color="#10b981" size={20} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, (!selected || loading) && styles.disabledButton]} 
          onPress={handleFinish}
          disabled={!selected || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Finish Setup</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#34d399', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    backgroundColor: '#111827', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(52,211,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 100
  },
  cardSelected: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(52,211,153,0.1)'
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cardTextSelected: {
    color: '#34d399'
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0f1e', borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.1)' },
  primaryButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
});
