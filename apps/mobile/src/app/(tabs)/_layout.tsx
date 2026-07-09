import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/auth';
import { ActivityIndicator, View } from 'react-native';
import { Search, ClipboardList } from 'lucide-react-native';

export default function TabLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#00A884', headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'TradO',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
