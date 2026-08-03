import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import * as SecureStore from 'expo-secure-store';

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<string>('1'); // Mock ID
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch these from your Next.js `/api/conversations` endpoint
    SecureStore.getItemAsync('user-phone').then((phone) => {
      setUserId(phone || '1');
      
      setMessages([
        {
          _id: 1,
          text: 'Hello from SuprO WhatsApp CRM!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'SuprO Admin',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ]);
      setLoading(false);
    });
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages),
    );
    
    // Here you would send the message to your Next.js backend:
    // fetch(`${endpoints.whatsappSend}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ message: newMessages[0].text, to: 'user-phone' })
    // })
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userId, // This determines which side the bubble renders on
        }}
        alwaysShowSend
        placeholder="Type a WhatsApp message..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e', // Match our dark theme
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
