import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/auth';
import { ActivityIndicator, View } from 'react-native';
import { Search, ClipboardList, Users, LayoutDashboard, MessageSquare, Briefcase } from 'lucide-react-native';

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
          title: 'TradO',
          tabBarLabel: 'Explore',
          href: isAdmin ? null : '/', // Hide from admins
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          href: isAdmin ? null : '/requests',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      {/* --------------------- ADMIN TABS (CRM) --------------------- */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          href: isAdmin ? '/dashboard' : null, // Only for admins
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarLabel: 'Inbox',
          href: isAdmin ? '/inbox' : null,
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="providers"
        options={{
          title: 'Providers',
          tabBarLabel: 'Providers',
          href: isAdmin ? '/providers' : null,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="crm"
        options={{
          title: 'CRM Hub',
          tabBarLabel: 'CRM',
          href: isAdmin ? '/crm' : null,
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
