import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, ShoppingBag, CheckCircle2, Gift } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { RewardsService, UserBalance, Coupon, Reward } from '../services/RewardsService';

// Hardcoded catalog (same as web)
const REWARDS_CATALOG: Reward[] = [
  {
    id: 'reward_1',
    name: '₹50 SuprO Discount',
    description: 'Get ₹50 off your next Agro order',
    points_cost: 500,
    value: 50,
    currency: 'INR',
    type: 'discount'
  },
  {
    id: 'reward_2',
    name: '10% RideO Promo',
    description: '10% off your next RideO trip',
    points_cost: 300,
    value: 10,
    currency: 'PERCENT',
    type: 'discount'
  },
  {
    id: 'reward_3',
    name: 'Free Teacho Course',
    description: 'Unlock one premium Teacho course',
    points_cost: 1500,
    value: 100,
    currency: 'PERCENT',
    type: 'freebie'
  }
];

export default function RewardsScreen() {
  const navigation = useNavigation<any>();
  const { session } = useContext(AppContext);
  const user = session?.user;
  
  const [balance, setBalance] = useState<UserBalance>({ testoPoints: 0, farmPoints: 0 });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const bal = await RewardsService.getUserBalance(user.id);
      setBalance(bal);
      
      const userCoupons = await RewardsService.getUserCoupons(user.id);
      setCoupons(userCoupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleRedeem = async (reward: Reward) => {
    if (!user?.id) return;
    
    const totalPoints = balance.testoPoints + balance.farmPoints;
    if (totalPoints < reward.points_cost) {
      Alert.alert('Insufficient Points', 'You do not have enough points for this reward.');
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to spend ${reward.points} points on ${reward.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          style: 'default',
          onPress: async () => {
            setIsRedeeming(reward.id);
            const code = await RewardsService.redeemReward(user.id, reward);
            if (code) {
              Alert.alert('Success', `You have successfully redeemed ${reward.name}! Your code is: ${code}`);
              await loadData();
            } else {
              Alert.alert('Error', 'Failed to redeem reward. Please try again.');
            }
            setIsRedeeming(null);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  const totalPoints = balance.testoPoints + balance.farmPoints;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards Store</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>{totalPoints} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* My Coupons Section */}
        <View style={styles.sectionHeader}>
          <Gift color="#34d399" size={20} />
          <Text style={styles.sectionTitle}>My Coupons</Text>
        </View>
        
        {coupons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No coupons yet. Buy some below!</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {coupons.map(coupon => (
              <View key={coupon.id} style={styles.couponCard}>
                <View style={styles.couponHeader}>
                  <Text style={styles.couponName}>{coupon.reward?.name || 'Discount Coupon'}</Text>
                </View>
                <View style={styles.couponCodeBox}>
                  <CheckCircle2 color="#34d399" size={16} />
                  <Text style={styles.couponCodeText}>{coupon.coupon_code}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Store Catalog */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <ShoppingBag color="#c4b5fd" size={20} />
          <Text style={styles.sectionTitle}>Available Rewards</Text>
        </View>
        
        <View style={styles.catalogGrid}>
          {REWARDS_CATALOG.map(reward => {
            const canAfford = totalPoints >= reward.points_cost;
            const redeeming = isRedeeming === reward.id;
            
            return (
              <View key={reward.id} style={styles.storeCard}>
                <View style={styles.storeCardTop}>
                  <Text style={styles.storeCardTitle}>{reward.name}</Text>
                  <Text style={styles.storeCardDesc}>{reward.description}</Text>
                </View>
                
                <View style={styles.storeCardBottom}>
                  <Text style={styles.storeCardCost}>{reward.points_cost} pts</Text>
                  <TouchableOpacity
                    style={[styles.redeemBtn, (!canAfford || redeeming) && styles.redeemBtnDisabled]}
                    disabled={!canAfford || redeeming}
                    onPress={() => handleRedeem(reward)}
                  >
                    {redeeming ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.redeemBtnText}>Redeem</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  centerContainer: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  pointsBadge: { backgroundColor: '#fde04720', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#fde047' },
  pointsBadgeText: { color: '#fde047', fontWeight: '900', fontSize: 14 },
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  emptyCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  emptyText: { color: '#64748b', fontSize: 14 },
  
  couponCard: { width: 200, backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  couponHeader: { marginBottom: 12 },
  couponName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  couponCodeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b98120', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#10b98140' },
  couponCodeText: { color: '#34d399', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 16 },
  
  catalogGrid: { gap: 16 },
  storeCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  storeCardTop: { marginBottom: 16 },
  storeCardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  storeCardDesc: { color: '#94a3b8', fontSize: 14 },
  storeCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 16 },
  storeCardCost: { color: '#fde047', fontSize: 20, fontWeight: '900' },
  redeemBtn: { backgroundColor: '#8b5cf6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  redeemBtnDisabled: { backgroundColor: '#334155' },
  redeemBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
