import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Car, GraduationCap, MonitorPlay, Wallet, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'admin', title: 'Admin', desc: 'CRM & All Modules', icon: Wallet, color: '#f87171', bg: '#f8717120', route: 'Dashboard', tab: 'Admin' },
  { id: 'rideo', title: 'RideO', desc: 'Book Cabs & Autos', icon: Car, color: '#10b981', bg: '#10b98120', route: 'Dashboard', tab: 'Map' },
  { id: 'driveo', title: 'DriveO', desc: 'Accept Rides', icon: MapPin, color: '#3b82f6', bg: '#3b82f620', route: 'Dashboard', tab: 'Map' },
  { id: 'testo', title: 'TestO', desc: 'Mock Exams', icon: GraduationCap, color: '#8b5cf6', bg: '#8b5cf620', route: 'Dashboard', tab: 'TestO' },
  { id: 'teacho', title: 'TeachO', desc: 'Learn & Teach', icon: GraduationCap, color: '#f59e0b', bg: '#f59e0b20', route: 'Dashboard', tab: 'TeachO' },
  { id: 'tvo', title: 'TvO', desc: 'Watch & Earn', icon: MonitorPlay, color: '#ec4899', bg: '#ec489920', route: 'Dashboard', tab: 'TvO' },
  { id: 'moneyo', title: 'MoneyO', desc: 'Digital Wallet', icon: Wallet, color: '#14b8a6', bg: '#14b8a620', route: 'Dashboard', tab: 'MoneyO' },
];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();

  const handleSelect = (cat: any) => {
    // Navigate to Dashboard tabs, optionally with a specific tab focus
    if (cat.tab) {
      navigation.replace(cat.route, { screen: cat.tab });
    } else {
      navigation.replace(cat.route);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>What do you need?</Text>
        <Text style={styles.subtitle}>Select a service to get started</Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.card, { borderColor: cat.color + '40' }]} 
              activeOpacity={0.7}
              onPress={() => handleSelect(cat)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: cat.bg }]}>
                <Icon color={cat.color} size={32} />
              </View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Aishlee Technology</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e', // Dark theme matching LoginScreen
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - 48 - 16) / 2, // 2 columns, considering padding and gap
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
