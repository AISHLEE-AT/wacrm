import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Wallet, RefreshCw, Gift } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { RewardsService, UserBalance } from '../services/RewardsService';

export default function GamingHubScreen() {
  const navigation = useNavigation<any>();
  const { session } = useContext(AppContext);
  const user = session?.user;
  
  const [balance, setBalance] = useState<UserBalance>({ testoPoints: 0, farmPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const bal = await RewardsService.getUserBalance(user.id);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    const success = await RewardsService.syncPointsToServer(user.id);
    if (success) {
      Alert.alert('Success', 'Offline points synced to cloud!');
      await loadData();
    } else {
      Alert.alert('Error', 'Failed to sync points');
    }
    setIsSyncing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gaming Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Balances Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Wallet color="#60a5fa" size={20} />
              <Text style={styles.cardTitle}>My Wallet</Text>
            </View>
            <TouchableOpacity 
              onPress={handleSync} 
              disabled={isSyncing}
              style={styles.syncBtn}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#60a5fa" />
              ) : (
                <>
                  <RefreshCw color="#60a5fa" size={14} />
                  <Text style={styles.syncBtnText}>Sync</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#8b5cf6" style={{ marginVertical: 40 }} />
          ) : (
            <View style={{ gap: 12 }}>
              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.balanceLabel}>Testo Points</Text>
                  <Text style={styles.balanceValue}>{balance.testoPoints}</Text>
                </View>
                <View style={[styles.currencyIcon, { backgroundColor: '#4f46e530' }]}>
                  <Text style={[styles.currencySymbol, { color: '#818cf8' }]}>T</Text>
                </View>
              </View>

              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.balanceLabel}>Farm Points</Text>
                  <Text style={styles.balanceValue}>{balance.farmPoints}</Text>
                </View>
                <View style={[styles.currencyIcon, { backgroundColor: '#10b98130' }]}>
                  <Text style={[styles.currencySymbol, { color: '#34d399' }]}>F</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Go to Rewards Store */}
        <TouchableOpacity 
          style={styles.rewardsStoreBtn}
          onPress={() => navigation.navigate('RewardsScreen')}
        >
          <Gift color="#fff" size={24} />
          <Text style={styles.rewardsStoreText}>Rewards Store & Coupons</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, gap: 16 },
  
  card: { backgroundColor: '#0f172a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f620', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#3b82f640' },
  syncBtnText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 12 },
  
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#00000040', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  balanceLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  currencyIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  currencySymbol: { fontSize: 24, fontWeight: '900' },

  rewardsStoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#8b5cf6', paddingVertical: 20, borderRadius: 20, marginTop: 12 },
  rewardsStoreText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
