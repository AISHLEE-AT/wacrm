import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/auth';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, TrendingUp, History, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react-native';

export default function WalletScreen() {
  const { session } = useAuth();
  
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadWallet();
    }
  }, [session]);

  const loadWallet = async () => {
    setLoading(true);
    
    // Get or create wallet
    const { data: wData } = await supabase
      .rpc('get_or_create_wallet', { uid: session?.user?.id })
      .single();
      
    if (wData) {
      setWallet(wData);
      
      // Get transactions
      const { data: tData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wData.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (tData) setTransactions(tData);
    }
    setLoading(false);
  };

  const handleAddFunds = async (amount: number) => {
    if (!wallet) return;
    setAddingFunds(true);
    
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      amount,
      type: 'credit',
      description: 'Added funds via card'
    });
    
    await supabase.from('wallets').update({
      balance: parseFloat(wallet.balance) + amount
    }).eq('id', wallet.id);
    
    await loadWallet();
    setAddingFunds(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.txItem}>
      <View style={styles.txLeft}>
        <View style={[styles.txIconBox, { backgroundColor: item.type === 'credit' ? '#ecfdf5' : '#fff1f2' }]}>
          {item.type === 'credit' ? (
            <ArrowDownLeft color="#10b981" size={20} />
          ) : (
            <ArrowUpRight color="#f43f5e" size={20} />
          )}
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>{item.description || (item.type === 'credit' ? 'Fund Added' : 'Payment')}</Text>
          <Text style={styles.txDate}>
            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <Text style={[styles.txAmount, { color: item.type === 'credit' ? '#10b981' : '#0f172a' }]}>
        {item.type === 'credit' ? '+' : '-'}₹{item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Manage your digital balance</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Balance Card */}
        <LinearGradient
          colors={['#312e81', '#4338ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>₹{wallet?.balance || "0.00"}</Text>
            </View>
            <View style={styles.iconBg}>
              <Wallet color="#fff" size={24} />
            </View>
          </View>
          
          <View style={styles.cardBottomRow}>
            <TouchableOpacity 
              style={styles.addFundsBtn}
              onPress={() => handleAddFunds(500)}
              disabled={addingFunds}
            >
              {addingFunds ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Plus color="#fff" size={16} />
                  <Text style={styles.addFundsText}>Add ₹500</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Loyalty Points */}
        <LinearGradient
          colors={['#047857', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loyaltyCard}
        >
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Loyalty Points</Text>
              <Text style={styles.balanceValue}>{wallet?.loyalty_points || 0}</Text>
            </View>
            <View style={styles.iconBg}>
              <TrendingUp color="#fff" size={24} />
            </View>
          </View>
          <Text style={styles.loyaltyDesc}>Earn points on every ride & service.</Text>
        </LinearGradient>

        {/* Transactions */}
        <View style={styles.txCard}>
          <View style={styles.txHeader}>
            <History color="#64748b" size={20} />
            <Text style={styles.txHeaderTitle}>Recent Transactions</Text>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet color="#cbd5e1" size={48} />
              <Text style={styles.emptyText}>No transactions yet.</Text>
            </View>
          ) : (
            transactions.map((tx) => renderTransaction({ item: tx }))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7F9' },
  header: { padding: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  content: { padding: 20 },
  
  balanceCard: { borderRadius: 24, padding: 24, shadowColor: '#312e81', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 16 },
  loyaltyCard: { borderRadius: 24, padding: 24, shadowColor: '#047857', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 24 },
  
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  iconBg: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16 },
  
  cardBottomRow: { marginTop: 30, flexDirection: 'row' },
  addFundsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addFundsText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  loyaltyDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 16 },
  
  txCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  txHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 8 },
  txHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginLeft: 12 },
  
  txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  txIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  txDate: { fontSize: 13, color: '#64748b' },
  txAmount: { fontSize: 18, fontWeight: 'bold' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16, fontWeight: '500' }
});
