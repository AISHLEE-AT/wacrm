import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers/auth';
import { Search, MapPin, Zap, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  'All', 'Food & Beverages', 'Home Services', 'Transportation', 'Education',
  'Healthcare', 'Beauty & Wellness', 'Cleaning', 'Events', 'Retail & Shopping', 'Other'
];

interface Provider {
  id: string;
  business_name: string;
  category: string;
  pincode: string;
  services: string[];
}

// Memoized Provider Card for FlatList performance
const ProviderCard = React.memo(({ 
  provider, 
  selected, 
  onToggle 
}: { 
  provider: Provider, 
  selected: boolean, 
  onToggle: (id: string) => void 
}) => {
  return (
    <TouchableOpacity
      style={[styles.providerCard, selected && styles.providerCardSelected]}
      onPress={() => onToggle(provider.id)}
    >
      <View style={styles.providerLeft}>
        <View style={[styles.avatar, selected && styles.avatarSelected]}>
          <Text style={[styles.avatarText, selected && styles.avatarTextSelected]}>
            {provider.business_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName} numberOfLines={1}>{provider.business_name}</Text>
          <Text style={styles.providerMeta}>{provider.category} • {provider.pincode}</Text>
        </View>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <CheckCircle2 color="#fff" size={16} />}
      </View>
    </TouchableOpacity>
  );
});

export default function TradoDashboard() {
  const { session } = useAuth();
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('All');
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim() || !pincode.trim()) {
      Alert.alert('Missing Info', 'Please enter both what you are looking for and your pincode.');
      return;
    }

    setSearching(true);
    setSearched(true);
    setSelectedIds(new Set());

    try {
      let query = supabase.from('providers').select('*');
      query = query.eq('pincode', pincode.trim());
      if (category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      const kw = keyword.toLowerCase();
      const scored = (data || [])
        .map((p) => {
          let score = 0;
          if (p.business_name?.toLowerCase().includes(kw)) score += 3;
          if (p.category?.toLowerCase().includes(kw)) score += 2;
          if ((p.services || []).some((s: string) => s.toLowerCase().includes(kw))) score += 5;
          return { provider: p, score };
        })
        .filter((item) => item.score > 0 || category !== 'All')
        .sort((a, b) => b.score - a.score)
        .map((item) => item.provider);

      setProviders(scored);
      setSelectedIds(new Set(scored.map((p) => p.id)));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search providers.');
    } finally {
      setSearching(false);
    }
  };

  const handleBroadcast = async () => {
    if (selectedIds.size === 0 || !keyword.trim() || !pincode.trim()) return;
    
    setBroadcasting(true);
    try {
      const { data: request, error: reqError } = await supabase
        .from('requests')
        .insert({
          item_requested: keyword.trim(),
          pincode: pincode.trim(),
          category: category === 'All' ? 'Other' : category,
          buyer_user_id: session?.user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (reqError || !request) throw reqError || new Error("Failed to create request");

      const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('localhost') 
        ? 'http://192.168.1.100:3000/api/tradeo/broadcast' 
        : 'https://watscrrm.vercel.app/api/tradeo/broadcast';

      const broadRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          provider_ids: Array.from(selectedIds),
          item_requested: keyword.trim(),
          pincode: pincode.trim()
        })
      });

      if (!broadRes.ok) {
        console.warn("Broadcast API failed, but request created.");
      } else {
        await supabase.from('requests').update({ status: 'broadcasted' }).eq('id', request.id);
      }

      router.replace('/(tabs)/requests');
    } catch (err: any) {
      Alert.alert('Broadcast Error', err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const toggleProvider = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <Zap color="#00A884" size={24} />
          </View>
          <Text style={styles.title}>TradO</Text>
        </View>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Find the best provider, get quotes via WhatsApp.</Text>

      <View style={styles.searchPanel}>
        <Text style={styles.panelTitle}>🔍 What are you looking for?</Text>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item: cat }) => (
            <TouchableOpacity 
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.inputWrapper}>
          <Search color="#999" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search (e.g. Biriyani, Plumber...)"
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MapPin color="#999" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Pincode (e.g. 600001)"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          style={[styles.searchBtn, (!keyword || !pincode) && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!keyword || !pincode || searching}
        >
          {searching ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Find Providers</Text>}
        </TouchableOpacity>
      </View>

      {searched && (
        <View style={styles.resultsHeaderContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {providers.length > 0 ? `✅ ${providers.length} provider(s) found` : `❌ No providers found`}
            </Text>
            {providers.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedIds(new Set())}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {providers.length === 0 && (
            <View style={styles.emptyState}>
              <AlertCircle color="#ccc" size={40} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateText}>No registered providers match your search in this pincode.</Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  const renderFooter = () => {
    if (!searched || providers.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={[styles.broadcastBtn, (selectedIds.size === 0 || broadcasting) && styles.searchBtnDisabled]}
          onPress={handleBroadcast}
          disabled={selectedIds.size === 0 || broadcasting}
        >
          {broadcasting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Zap color="#fff" size={20} />
              <Text style={styles.broadcastBtnText}>
                Request Quotes from {selectedIds.size} Provider(s) via WhatsApp
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={searched ? providers : []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.providerCardContainer}>
              <ProviderCard 
                provider={item} 
                selected={selectedIds.has(item.id)} 
                onToggle={toggleProvider} 
              />
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
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
  signOutText: {
    color: '#666',
    fontWeight: '600',
  },
  subtitle: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    color: '#666',
    fontSize: 14,
  },
  searchPanel: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E4E6E9',
  },
  categoryChipActive: {
    backgroundColor: '#00A884',
    borderColor: '#00A884',
  },
  categoryText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E6E9',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FAFBFC',
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111',
  },
  searchBtn: {
    backgroundColor: '#00A884',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  searchBtnDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsHeaderContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  clearText: {
    color: '#666',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
  providerCardContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 20,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E6E9',
    marginBottom: 12,
    backgroundColor: '#FAFBFC',
  },
  providerCardSelected: {
    borderColor: '#00A884',
    backgroundColor: '#E0F2EC',
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E4E6E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: '#00A884',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  avatarTextSelected: {
    color: '#fff',
  },
  providerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#111',
    marginBottom: 2,
  },
  providerMeta: {
    fontSize: 13,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E4E6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#00A884',
    borderColor: '#00A884',
  },
  footerContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  broadcastBtn: {
    flexDirection: 'row',
    backgroundColor: '#00A884',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  }
});
