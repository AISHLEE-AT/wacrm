import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers/auth';
import { Clock, Zap, CheckCircle2, ChevronRight, ClipboardList } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

interface RequestItem {
  id: string;
  item_requested: string;
  pincode: string;
  category: string;
  status: string;
  created_at: string;
  quotes_count?: number; 
}

export default function RequestsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        fetchRequests();
      }
    }, [session?.user?.id])
  );

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch requests for this buyer, ordered by newest first
      // We can also select quotes to get the count
      const { data, error } = await supabase
        .from('requests')
        .select('*, quotes(id)')
        .eq('buyer_user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map(r => ({
        ...r,
        quotes_count: r.quotes?.length || 0
      }));

      setRequests(formatted);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { text: '#D97706', bg: '#FEF3C7' }; // Amber
      case 'broadcasted': return { text: '#2563EB', bg: '#DBEAFE' }; // Blue
      case 'closed': return { text: '#059669', bg: '#D1FAE5' }; // Emerald
      default: return { text: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const getStatusIcon = (status: string, color: string) => {
    switch(status) {
      case 'pending': return <Clock color={color} size={12} />;
      case 'broadcasted': return <Zap color={color} size={12} />;
      case 'closed': return <CheckCircle2 color={color} size={12} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <ClipboardList color="#00A884" size={24} />
          </View>
          <Text style={styles.title}>My Requests</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A884" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <ClipboardList color="#ccc" size={48} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>You haven't made any requests yet.</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Go to Explore</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/request/[id]', params: { id: item.id } })}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.itemTitle}>{item.item_requested}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      {getStatusIcon(item.status, statusStyle.text)}
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.metaText}>
                    📍 {item.pincode} • {item.quotes_count} quote{item.quotes_count !== 1 ? 's' : ''} • {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <ChevronRight color="#C1C7CD" size={20} />
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6E9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    backgroundColor: '#E0F2EC',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#00A884',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  }
});
