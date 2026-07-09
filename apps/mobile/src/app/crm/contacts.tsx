import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { UserCircle2, Search, Phone, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setContacts(data as Contact[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.phone_number || '').includes(s)
    );
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color="#0f172a" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Contacts</Text>
        </View>
        <Text style={styles.subtitle}>{contacts.length} saved contacts</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <View style={styles.avatar}>
              <UserCircle2 color="#94a3b8" size={32} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name || 'Unknown Contact'}</Text>
              <View style={styles.phoneRow}>
                <Phone color="#64748b" size={14} />
                <Text style={styles.phoneText}>+{item.phone_number}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', margin: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#0f172a' },
  contactItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  contactInfo: { flex: 1, justifyContent: 'center' },
  contactName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  phoneText: { fontSize: 14, color: '#64748b', marginLeft: 6 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 16, color: '#94a3b8' }
});
