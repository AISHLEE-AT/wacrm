import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Clock, Zap, CheckCircle2, IndianRupee } from 'lucide-react-native';

interface RequestDetails {
  id: string;
  item_requested: string;
  pincode: string;
  status: string;
  created_at: string;
}

interface Quote {
  id: string;
  price: number;
  status: string;
  created_at: string;
  provider_id: string;
  providers?: {
    business_name: string;
    phone_number: string;
  };
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
      
      // Set up real-time subscription for quotes!
      const channel = supabase
        .channel(`public:quotes:request_id=eq.${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes', filter: `request_id=eq.${id}` }, () => {
          fetchDetails(); // Refetch if quotes change
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      }
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [reqRes, quotesRes] = await Promise.all([
        supabase.from('requests').select('*').eq('id', id).single(),
        supabase.from('quotes').select('*, providers(business_name, phone_number)').eq('request_id', id).order('price', { ascending: true })
      ]);

      if (reqRes.error) throw reqRes.error;
      
      setRequest(reqRes.data);
      if (quotesRes.data) {
        setQuotes(quotesRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    Alert.alert(
      "Accept Quote",
      `Are you sure you want to accept the quote from ${quote.providers?.business_name} for ₹${quote.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: async () => {
            setAcceptingId(quote.id);
            try {
              // 1. Update quote status to 'accepted'
              await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id);
              // 2. Update request status to 'closed'
              await supabase.from('requests').update({ status: 'closed' }).eq('id', id);
              
              // 3. Trigger WhatsApp notification via Next.js API (Optional but good)
              const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('localhost') 
                ? 'http://192.168.1.100:3000/api/tradeo/accept' // local
                : 'https://watscrrm.vercel.app/api/tradeo/accept'; // prod
                
              fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  request_id: id,
                  quote_id: quote.id
                })
              }).catch(console.warn);

              // Refetch immediately
              await fetchDetails();
              Alert.alert("Deal Closed!", "The provider will contact you shortly.");
            } catch (err: any) {
              Alert.alert("Error", err.message);
            } finally {
              setAcceptingId(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return { text: '#D97706', bg: '#FEF3C7' };
      case 'broadcasted': return { text: '#2563EB', bg: '#DBEAFE' };
      case 'closed': return { text: '#059669', bg: '#D1FAE5' };
      default: return { text: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const getStatusIcon = (status: string, color: string) => {
    switch(status) {
      case 'pending': return <Clock color={color} size={14} />;
      case 'broadcasted': return <Zap color={color} size={14} />;
      case 'closed': return <CheckCircle2 color={color} size={14} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Request not found.</Text>
      </View>
    );
  }

  const statusStyle = getStatusColor(request.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.reqCard}>
            <Text style={styles.reqItem}>{request.item_requested}</Text>
            <View style={styles.reqMeta}>
              <Text style={styles.metaText}>📍 {request.pincode}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{new Date(request.created_at).toLocaleString()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              {getStatusIcon(request.status, statusStyle.text)}
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Text>
            </View>
            
            {request.status === 'broadcasted' && (
              <View style={styles.waitingAlert}>
                <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.waitingText}>Waiting for providers to submit quotes via WhatsApp...</Text>
              </View>
            )}
            {request.status === 'closed' && (
              <View style={[styles.waitingAlert, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
                <CheckCircle2 color="#059669" size={20} style={{ marginRight: 8 }} />
                <Text style={[styles.waitingText, { color: '#059669' }]}>This deal has been closed.</Text>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Quotes Received ({quotes.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyQuotes}>
            <Clock color="#ccc" size={40} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No quotes yet.</Text>
            <Text style={styles.emptySub}>Providers have received the request on WhatsApp and are preparing their best prices.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.quoteCard, 
            item.status === 'accepted' && styles.quoteCardAccepted,
            request.status === 'closed' && item.status !== 'accepted' && styles.quoteCardRejected
          ]}>
            <View style={styles.quoteLeft}>
              <View style={styles.quoteAvatar}>
                <Text style={styles.quoteAvatarText}>
                  {item.providers?.business_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.quoteInfo}>
                <Text style={styles.providerName}>{item.providers?.business_name || 'Unknown'}</Text>
                <Text style={styles.quoteTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            </View>
            
            <View style={styles.quoteRight}>
              <View style={styles.priceTag}>
                <IndianRupee color="#059669" size={14} />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
              
              {item.status === 'accepted' ? (
                <View style={styles.acceptedBadge}>
                  <CheckCircle2 color="#fff" size={12} />
                  <Text style={styles.acceptedText}>Accepted</Text>
                </View>
              ) : request.status !== 'closed' ? (
                <TouchableOpacity 
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptQuote(item)}
                  disabled={acceptingId === item.id}
                >
                  {acceptingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F9' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50, // safe area equivalent
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6E9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  listContainer: { padding: 16 },
  reqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reqItem: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  reqMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  metaText: { fontSize: 14, color: '#666' },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: { fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  waitingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  waitingText: { flex: 1, fontSize: 13, color: '#1E3A8A' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginTop: 8 },
  emptyQuotes: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E6E9',
  },
  quoteCardAccepted: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  quoteCardRejected: {
    opacity: 0.5,
  },
  quoteLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  quoteAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#E4E6E9',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  quoteAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#666' },
  quoteInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  quoteTime: { fontSize: 12, color: '#666' },
  quoteRight: { alignItems: 'flex-end' },
  priceTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#059669', marginLeft: 2 },
  acceptBtn: {
    backgroundColor: '#00A884',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  acceptedBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  acceptedText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 4 }
});
