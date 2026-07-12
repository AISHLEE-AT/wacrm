import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Car, Zap, Shield, Briefcase, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SuperAppHome() {
  const router = useRouter();

  const handleNavigation = (path: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <Zap color="#00A884" size={24} />
          </View>
          <View>
            <Text style={styles.title}>Super App</Text>
            <Text style={styles.subtitle}>Your world in one place</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>What do you need today?</Text>

        <TouchableOpacity style={styles.card} onPress={() => handleNavigation('/(tabs)/transo')} activeOpacity={0.8}>
          <LinearGradient colors={['#E0F2EC', '#C2E5D3']} style={styles.cardGradient}>
            <View style={styles.cardHeader}>
              <Car color="#00A884" size={32} />
              <Text style={styles.badge}>TransO</Text>
            </View>
            <Text style={styles.cardTitle}>Book a Ride</Text>
            <Text style={styles.cardDesc}>Fast and reliable rides for your daily commute. Auto, Bike, and Cabs.</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handleNavigation('/(tabs)/trado')} activeOpacity={0.8}>
          <LinearGradient colors={['#E8EEF2', '#D0DCE3']} style={styles.cardGradient}>
            <View style={styles.cardHeader}>
              <Search color="#0F172A" size={32} />
              <Text style={[styles.badge, { color: '#0F172A', backgroundColor: '#CBD5E1' }]}>TradO</Text>
            </View>
            <Text style={[styles.cardTitle, { color: '#0F172A' }]}>Hire a Service</Text>
            <Text style={[styles.cardDesc, { color: '#334155' }]}>Find plumbers, electricians, catering, and more near you.</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handleNavigation('/(tabs)/drivo')} activeOpacity={0.8}>
          <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.cardGradient}>
            <View style={styles.cardHeader}>
              <Briefcase color="#E65100" size={32} />
              <Text style={[styles.badge, { color: '#E65100', backgroundColor: '#FFCC80' }]}>DrivO</Text>
            </View>
            <Text style={[styles.cardTitle, { color: '#E65100' }]}>Drive & Earn</Text>
            <Text style={[styles.cardDesc, { color: '#F57C00' }]}>Register your vehicle and start earning by driving for TransO.</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Shield color="#00A884" size={24} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Safe & Secure</Text>
            <Text style={styles.infoDesc}>All our drivers and service providers are verified for your safety.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    backgroundColor: '#112211',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#00A884'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#aaa', fontSize: 14, marginTop: 2 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 16, marginTop: 8 },
  card: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  badge: { backgroundColor: '#B8DFCE', color: '#006644', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#004422', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#006644', lineHeight: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#E4E6E9' },
  infoTextContainer: { marginLeft: 16, flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  infoDesc: { fontSize: 13, color: '#666', lineHeight: 18 }
});
