import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/auth';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { session, loading, accountRole } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  const isAdmin = accountRole === 'admin' || accountRole === 'owner';

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#00A884', headerShown: true }}>
      {/* --------------------- USER TABS (MARKETPLACE) --------------------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'TradeO',
          tabBarLabel: 'Explore',
          href: isAdmin ? null : '/', // Hide from admins
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          href: isAdmin ? null : '/requests',
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          title: 'Providers',
          tabBarLabel: 'Providers',
          href: isAdmin ? null : '/providers',
        }}
      />

      {/* --------------------- ADMIN TABS (CRM) --------------------- */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          href: isAdmin ? '/dashboard' : null, // Only for admins
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarLabel: 'Inbox',
          href: isAdmin ? '/inbox' : null,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarLabel: 'Contacts',
          href: isAdmin ? '/contacts' : null,
        }}
      />
    </Tabs>
  );
}
