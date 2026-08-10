import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import * as SecureStore from 'expo-secure-store';
import { MessageCircle } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';

const ADMIN_CRM_NUMBER = '6381029380';

export default function ChatScreen({ navigation }: any) {
  const { geminiApiKey } = useContext(AppContext);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<string>('1'); 
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('user-phone').then((phone) => {
      setUserId(phone || '1');
      
      const welcomeMsg: IMessage = {
        _id: 1,
        text: geminiApiKey 
          ? "Hi! I'm your AI Assistant. How can I help you today?" 
          : "Welcome! Please configure your Gemini API Key in the Profile tab to enable AI responses.",
        createdAt: new Date(),
        user: { _id: 2, name: 'AI Assistant', avatar: 'https://ui-avatars.com/api/?name=AI&background=10b981&color=fff' },
      };
      
      setMessages([welcomeMsg]);
      setLoading(false);
    });
  }, [geminiApiKey]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    
    if (!geminiApiKey) {
      setTimeout(() => {
        setMessages((prev) => GiftedChat.append(prev, [{
          _id: Math.random().toString(),
          text: "I cannot respond without a Gemini API Key. Please add it in your Profile tab.",
          createdAt: new Date(),
          user: { _id: 2, name: 'System' },
        }]));
      }, 500);
      return;
    }

    setIsTyping(true);
    const userText = newMessages[0].text;

    try {
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }]
        })
      });

      if (!response.ok) {
        // Fallback to gemini-2.0-flash if 2.5 is not available on key tier
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userText }] }]
          })
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      
      setMessages((prev) => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: aiResponseText,
        createdAt: new Date(),
        user: { _id: 2, name: 'AI Assistant', avatar: 'https://ui-avatars.com/api/?name=AI&background=10b981&color=fff' },
      }]));
      
    } catch (err: any) {
      setMessages((prev) => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: `Error from Gemini: ${err.message}. Please check your API key in Profile.`,
        createdAt: new Date(),
        user: { _id: 2, name: 'System' },
      }]));
    } finally {
      setIsTyping(false);
    }
  }, [geminiApiKey]);

  const contactAdmin = () => {
    const text = encodeURIComponent('Hi, I need help with SuprO!');
    const appUrl = `whatsapp://send?phone=91${ADMIN_CRM_NUMBER}&text=${text}`;
    const webUrl = `https://wa.me/91${ADMIN_CRM_NUMBER}?text=${text}`;
    
    Linking.canOpenURL(appUrl).then(supported => {
      if (supported) {
        Linking.openURL(appUrl);
      } else {
        // Fallback to web URL which handles routing to the app automatically
        Linking.openURL(webUrl);
      }
    }).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox / AI Bot</Text>
        <TouchableOpacity style={styles.whatsappBtn} onPress={contactAdmin}>
          <MessageCircle color="#fff" size={16} />
          <Text style={styles.whatsappTxt}>Live Support</Text>
        </TouchableOpacity>
      </View>
      
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: userId }}
        isTyping={isTyping}
        alwaysShowSend
        placeholder={geminiApiKey ? "Ask me anything..." : "API key required..."}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: { backgroundColor: '#10b981' },
                left: { backgroundColor: '#1e293b' }
              }}
              textStyle={{
                right: { color: '#fff' },
                left: { color: '#fff' }
              }}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  whatsappBtn: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6
  },
  whatsappTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
