import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView, Switch } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Users, Plus, X, Search, Phone, MapPin, Tag, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../providers/auth';

const TRADEO_CATEGORIES = [
  'Food & Beverages', 'Home Services', 'Transportation', 'Education',
  'Healthcare', 'Beauty & Wellness', 'Cleaning', 'Events', 'Retail & Shopping', 'Other'
];

interface Provider {
  id: string;
  business_name: string;
  phone_number: string;
  pincode: string;
  category: string;
  services: string[];
  is_active: boolean;
  quotes?: { id: string }[];
}

export default function ProvidersScreen() {
  const { session } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    business_name: '', phone_number: '', pincode: '', category: 'Food & Beverages', services: [] as string[]
  });
  const [serviceInput, setServiceInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('providers')
      .select('*, quotes(id)')
      .order('created_at', { ascending: false });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('providers')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) {
      fetchProviders();
    }
  };

  const addService = () => {
    const s = serviceInput.trim();
    if (s && !form.services.includes(s)) {
      setForm({ ...form, services: [...form.services, s] });
      setServiceInput('');
    }
  };

  const handleSave = async () => {
    if (!form.phone_number || !form.pincode || !form.category) {
      Alert.alert('Required', 'Phone, Pincode and Category are required.');
      return;
    }
    setSaving(true);
    let phone = form.phone_number.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const { error } = await supabase
      .from('providers')
      .insert({
        business_name: form.business_name,
        phone_number: phone,
        pincode: form.pincode,
        category: form.category,
        services: form.services,
        is_active: true,
        user_id: session?.user?.id
      });

    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setShowForm(false);
      setForm({ business_name: '', phone_number: '', pincode: '', category: 'Food & Beverages', services: [] });
      fetchProviders();
    }
  };

  const filtered = providers.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.business_name?.toLowerCase().includes(s) ||
      p.phone_number?.includes(s) ||
      (p.services || []).some(sv => sv.toLowerCase().includes(s))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Provider Network</Text>
          <Text style={styles.subtitle}>{providers.length} registered providers</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#999" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, service..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A884" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.avatar, item.is_active ? styles.avatarActive : null]}>
                    <Text style={[styles.avatarText, item.is_active ? styles.avatarTextActive : null]}>
                      {item.business_name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.businessName}>{item.business_name || 'Unnamed'}</Text>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                  </View>
                </View>
                <Switch
                  value={item.is_active}
                  onValueChange={() => toggleActive(item.id, item.is_active)}
                  trackColor={{ false: '#ddd', true: '#a7f3d0' }}
                  thumbColor={item.is_active ? '#10b981' : '#f4f3f4'}
                />
              </View>

              <View style={styles.detailsRow}>
                <Phone color="#666" size={14} />
                <Text style={styles.detailsText}>+{item.phone_number}</Text>
              </View>
              <View style={styles.detailsRow}>
                <MapPin color="#666" size={14} />
                <Text style={styles.detailsText}>{item.pincode}</Text>
              </View>

              {item.services && item.services.length > 0 && (
                <View style={styles.servicesContainer}>
                  <Tag color="#666" size={14} style={{ marginTop: 4, marginRight: 6 }} />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                    {item.services.map(s => (
                      <View key={s} style={styles.servicePill}>
                        <Text style={styles.servicePillText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>{item.quotes?.length || 0} total quotes</Text>
                {item.is_active ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckCircle2 color="#10b981" size={14} />
                    <Text style={[styles.footerText, { color: '#10b981', marginLeft: 4 }]}>Active</Text>
                  </View>
                ) : (
                  <Text style={styles.footerText}>Inactive</Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Provider</Text>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Raja's Hotel"
              value={form.business_name}
              onChangeText={t => setForm({ ...form, business_name: t })}
            />

            <Text style={styles.label}>WhatsApp Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="9486335870"
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={t => setForm({ ...form, phone_number: t })}
            />

            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="606703"
              keyboardType="number-pad"
              maxLength={6}
              value={form.pincode}
              onChangeText={t => setForm({ ...form, pincode: t })}
            />

            <Text style={styles.label}>Category *</Text>
            {/* Simple buttons for category selection since standard picker requires external library */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {TRADEO_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, form.category === cat && styles.catBtnActive]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[styles.catBtnText, form.category === cat && styles.catBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Services / Keywords</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g. Biriyani"
                value={serviceInput}
                onChangeText={setServiceInput}
                onSubmitEditing={addService}
              />
              <TouchableOpacity style={styles.addServiceBtn} onPress={addService}>
                <Text style={styles.addServiceBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {form.services.map(s => (
                <View key={s} style={styles.servicePillActive}>
                  <Text style={styles.servicePillTextActive}>{s}</Text>
                  <TouchableOpacity onPress={() => setForm({ ...form, services: form.services.filter(x => x !== s) })}>
                    <X color="#10b981" size={14} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!form.phone_number || !form.pincode) && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !form.phone_number || !form.pincode}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Provider</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', marginLeft: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, marginTop: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarActive: { backgroundColor: '#d1fae5' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#64748b' },
  avatarTextActive: { color: '#10b981' },
  businessName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  categoryBadge: { fontSize: 12, color: '#64748b', marginTop: 2 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailsText: { fontSize: 13, color: '#64748b', marginLeft: 8 },
  servicesContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  servicePill: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  servicePillText: { fontSize: 11, color: '#64748b' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  closeBtn: { padding: 4 },
  formContent: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a', marginBottom: 16 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', marginRight: 8 },
  catBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  catBtnText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  catBtnTextActive: { color: '#fff' },
  addServiceBtn: { backgroundColor: '#f1f5f9', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  addServiceBtnText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  servicePillActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#34d399' },
  servicePillTextActive: { fontSize: 13, color: '#065f46', fontWeight: '500' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
