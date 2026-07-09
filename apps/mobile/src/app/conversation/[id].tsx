import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'agent' | 'bot' | 'customer';
  content_type: string;
  content_text: string;
  created_at: string;
  status: string;
}

interface Conversation {
  id: string;
  contact?: {
    name: string;
    phone_number: string;
  };
  status: string;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: convData } = await supabase
          .from('conversations')
          .select('*, contact:contacts(*)')
          .eq('id', id)
          .single();
        
        if (convData && isMounted) setConversation(convData);

        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });
        
        if (msgData && isMounted) {
          setMessages(msgData);
          setTimeout(() => {
            if (isMounted) flatListRef.current?.scrollToEnd({ animated: false });
          }, 200);
        }
      } catch (e) {
        console.log('Error fetching chat', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    // Mark as read
    supabase.from('conversations').update({ unread_count: 0 }).eq('id', id).then();

    const channel = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        if (!isMounted) return;
        const newMessage = payload.new as Message;
        setMessages(prev => {
          // Prevent duplicates
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setTimeout(() => {
          if (isMounted) flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !id) return;
    
    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');
    
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://watscrm.vercel.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: id,
          message_type: 'text',
          content_text: textToSend
        })
      });
      
      if (!res.ok) {
        Alert.alert('Error', 'Failed to send message via WhatsApp.');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error sending message.');
    } finally {
      setSending(false);
    }
  };

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

  const getContactName = () => {
    if (!conversation?.contact) return 'Unknown Contact';
    if (conversation.contact.name) return conversation.contact.name;
    if (conversation.contact.phone_number) return '+' + conversation.contact.phone_number;
    return 'Unknown Contact';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.contactName}>{getContactName()}</Text>
          <Text style={styles.statusText}>{conversation?.status === 'open' ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isAgent = item.sender_type === 'agent' || item.sender_type === 'bot';
          return (
            <View style={[styles.messageBubble, isAgent ? styles.messageAgent : styles.messageCustomer]}>
              <Text style={[styles.messageText, isAgent && styles.messageTextAgent]}>{item.content_text}</Text>
              <Text style={[styles.messageTime, isAgent && styles.messageTimeAgent]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet.</Text>
          </View>
        }
      />

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send color="#fff" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5ddd5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: '600', color: '#0f172a' },
  statusText: { fontSize: 12, color: '#64748b', textTransform: 'capitalize' },
  
  messageList: { padding: 16, paddingBottom: 32 },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageCustomer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageAgent: {
    alignSelf: 'flex-end',
    backgroundColor: '#d9fdd3',
    borderBottomRightRadius: 4,
  },
  messageText: { fontSize: 15, color: '#0f172a', lineHeight: 20 },
  messageTextAgent: { color: '#0f172a' },
  messageTime: { fontSize: 11, color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
  messageTimeAgent: { color: '#64748b' },
  
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748b' },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 10, 
    backgroundColor: '#f0f2f5',
    borderTopWidth: 1,
    borderTopColor: '#d1d5db'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingTop: 12,
    paddingBottom: 12, 
    fontSize: 16, 
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#00a884', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8 
  },
  sendBtnDisabled: { opacity: 0.5 },
});

