import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react-native';

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  unread_count: number;
  last_message_text: string;
  last_message_at: string;
  contact?: {
    name: string;
    phone_number: string;
  };
}

export default function InboxScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contact:contacts(*)')
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      setConversations(data as Conversation[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('inbox-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        <Text style={styles.title}>WhatsApp Inbox</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.convItem} 
            onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.id } })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.contact?.name ? item.contact.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.convInfo}>
              <View style={styles.convHeader}>
                <Text style={styles.contactName}>{item.contact?.name || '+' + item.contact?.phone_number}</Text>
                <Text style={styles.timeText}>{item.last_message_at ? formatTime(item.last_message_at) : ''}</Text>
              </View>
              <View style={styles.convSubHeader}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.last_message_text || 'No messages yet'}
                </Text>
                {item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread_count}</Text>
                  </View>
                )}
              </View>
              <View style={styles.statusRow}>
                {item.status === 'open' ? (
                  <Text style={[styles.statusText, { color: '#fbbf24' }]}><Clock size={10} color="#fbbf24" /> Open</Text>
                ) : (
                  <Text style={[styles.statusText, { color: '#34d399' }]}><CheckCircle2 size={10} color="#34d399" /> Closed</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare color="#ccc" size={48} />
            <Text style={styles.emptyText}>No conversations yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  convItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#64748b' },
  convInfo: { flex: 1, justifyContent: 'center' },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  contactName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  timeText: { fontSize: 12, color: '#94a3b8' },
  convSubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: 14, color: '#64748b', flex: 1, paddingRight: 10 },
  unreadBadge: { backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 16, color: '#94a3b8' }
});
