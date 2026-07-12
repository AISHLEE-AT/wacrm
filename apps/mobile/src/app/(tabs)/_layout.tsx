import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/auth';
import { ActivityIndicator, View } from 'react-native';
import { Search, ClipboardList, Car, MapPin, Wallet } from 'lucide-react-native';

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
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#00A884',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: true,
      tabBarStyle: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        height: 65,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        borderTopWidth: 0,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 12,
      },
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontFamily: 'Outfit_600SemiBold',
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Super App',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transo"
        options={{
          title: 'TransO',
          tabBarLabel: 'Rides',
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trado"
        options={{
          title: 'TradO',
          tabBarLabel: 'Services',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="drivo"
        options={{
          title: 'DrivO',
          tabBarLabel: 'Drive',
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="local-connect"
        options={{
          title: 'Local Connect',
          tabBarLabel: 'Connect',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
