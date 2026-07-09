import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Users, Package, TrendingUp, CheckCircle2 } from 'lucide-react-native';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ providers: 0, requests: 0, quotesToday: 0, closed: 0 });

  const fetchStats = async () => {
    try {
      const [provRes, reqRes] = await Promise.all([
        supabase.from('providers').select('id', { count: 'exact' }),
        supabase.from('requests').select('*, quotes(id, created_at)')
      ]);

      const providersCount = provRes.count || 0;
      const requestsData = reqRes.data || [];
      const requestsCount = requestsData.length;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      let quotesToday = 0;
      let closedDeals = 0;

      requestsData.forEach((req: any) => {
        if (req.status === 'closed') closedDeals++;
        if (req.quotes) {
          req.quotes.forEach((q: any) => {
            if (new Date(q.created_at) >= todayStart) {
              quotesToday++;
            }
          });
        }
      });

      setStats({ providers: providersCount, requests: requestsCount, quotesToday, closed: closedDeals });
    } catch (e) {
      console.log('Error fetching stats', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    { label: 'Providers', value: stats.providers, icon: <Users color="#60a5fa" size={24} />, bg: '#eff6ff', color: '#60a5fa' },
    { label: 'Total Requests', value: stats.requests, icon: <Package color="#c084fc" size={24} />, bg: '#faf5ff', color: '#c084fc' },
    { label: 'Quotes Today', value: stats.quotesToday, icon: <TrendingUp color="#fbbf24" size={24} />, bg: '#fffbeb', color: '#fbbf24' },
    { label: 'Deals Closed', value: stats.closed, icon: <CheckCircle2 color="#34d399" size={24} />, bg: '#ecfdf5', color: '#34d399' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Overview of TradO & CRM Activity</Text>
      </View>

      <View style={styles.grid}>
        {statCards.map((s, idx) => (
          <View key={idx} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: s.bg }]}>
              {s.icon}
            </View>
            <Text style={styles.cardValue}>{s.value}</Text>
            <Text style={styles.cardLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, paddingHorizontal: 15 },
  card: { 
    width: '47%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    margin: '1.5%',
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  cardLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
