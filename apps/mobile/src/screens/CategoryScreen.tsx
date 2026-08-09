// @ts-nocheck
// Aishlee platform URL — TeachO, TestO, TvO, MoneyO are served from here
const AISHLEE_BASE = 'https://thamizhan.vercel.app';
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Car, GraduationCap, MonitorPlay, Wallet, MapPin, ShoppingBag, Compass, Wrench, Shield, Award, Gamepad2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'admin', title: 'Admin CRM', desc: 'Manage Everything', icon: Shield, iconName: 'Shield', color: '#ef4444', bg: '#ef444420', path: '/admin', adminOnly: true },
  { id: 'rideo', title: 'RideO', desc: 'Book Cabs & Autos', icon: Car, iconName: 'Car', color: '#10b981', bg: '#10b98120', path: '/rideo' },
  { id: 'driveo', title: 'DriveO', desc: 'Driver Partner Hub', icon: MapPin, iconName: 'MapPin', color: '#3b82f6', bg: '#3b82f620', path: '/drivo' },
  { id: 'dealo', title: 'DealO', desc: 'Local Deals & Offers', icon: ShoppingBag, iconName: 'ShoppingBag', color: '#f97316', bg: '#f9731620', path: '/dealo' },
  { id: 'teacho', title: 'TeachO', desc: 'Courses & Tuitions', icon: GraduationCap, iconName: 'GraduationCap', color: '#f59e0b', bg: '#f59e0b20', path: '/teacho' },
  { id: 'rento', title: 'RentO', desc: 'Agri Equipment Rental', icon: Wrench, iconName: 'Wrench', color: '#84cc16', bg: '#84cc1620', path: '/rento' },
  { id: 'agro', title: 'AgrO & Mandi', desc: 'Crop Rates & Seeds', icon: Wrench, iconName: 'Wrench', color: '#10b981', bg: '#10b98120', path: '/agro' },
  { id: 'touro', title: 'TourO', desc: 'Temple & Local Tours', icon: Compass, iconName: 'Compass', color: '#06b6d4', bg: '#06b6d420', path: '/touro' },
  { id: 'testo', title: 'TestO', desc: 'Mock Exams & Quiz', icon: Award, iconName: 'Award', color: '#8b5cf6', bg: '#8b5cf620', path: '/testo' },
  { id: 'tvo', title: 'TvO', desc: 'Tamil Live TV & Streams', icon: MonitorPlay, iconName: 'MonitorPlay', color: '#ec4899', bg: '#ec489920', path: '/tvo' },
  { id: 'moneyo', title: 'MoneyO', desc: 'Micro Loans & Savings', icon: Wallet, iconName: 'Wallet', color: '#14b8a6', bg: '#14b8a620', path: '/moneyo' },
  { id: 'gameo', title: 'GameO', desc: 'MapRacer & Fitness', icon: Gamepad2, iconName: 'Gamepad2', color: '#8b5cf6', bg: '#8b5cf620', path: '/gameo' },
];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const { addRecentModule, userRole } = useContext(AppContext);

  const handleSelect = (cat: any) => {
    addRecentModule({
      name: cat.id,
      path: cat.path,
      label: cat.title,
      iconName: cat.iconName
    });
    if (cat.path === '/gameo') {
      navigation.navigate('GameOScreen');
    } else if (cat.path === '/agro') {
      navigation.navigate('AgrOScreen');
    } else if (cat.path === '/teacho') {
      navigation.navigate('TeachOScreen');
    } else if (
      cat.path === '/testo' ||
      cat.path === '/tvo' ||
      cat.path === '/moneyo'
    ) {
      // These modules are powered by the Aishlee platform directly
      navigation.navigate('ModuleView', {
        url: `${AISHLEE_BASE}${cat.path}`,
        moduleName: cat.title,
        path: cat.path,
      });
    } else {
      navigation.navigate('ModuleView', {
        path: cat.path,
        moduleName: cat.title,
      });
    }
  };

  const filteredCategories = CATEGORIES.filter(c => !c.adminOnly || userRole === 'admin');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>SuprO Ecosystem</Text>
        <Text style={styles.subtitle}>Select a module to get started</Text>
      </View>

      <View style={styles.grid}>
        {filteredCategories.map((cat) => {
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
    backgroundColor: '#0a0f1e',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: (width - 54) / 2,
    backgroundColor: '#0d1526',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
  },
});
