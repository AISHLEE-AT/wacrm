import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, MonitorPlay, Wallet, Home, Map, MessageCircle, LayoutGrid, User, Bot } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import DashboardScreen from './src/screens/DashboardScreen'; // Will be refactored to ProfileScreen
import EcosystemWebView from './src/screens/EcosystemWebView';
import MapScreen from './src/screens/MapScreen';
import ChatScreen from './src/screens/ChatScreen'; // AI Bot / CRM fallback

import { AppProvider, AppContext } from './src/context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const { recentModules } = useContext(AppContext);

  // Helper to dynamically hide/show tabs based on recent usage
  const getTabOptions = (tabName: string, title: string, IconComponent: any) => {
    const isRecent = recentModules.includes(tabName);
    return {
      title,
      tabBarIcon: ({ color, size }: any) => <IconComponent color={color} size={size} />,
      // If not in recent modules, hide it from the bottom bar
      tabBarButton: isRecent ? undefined : () => null,
    };
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      {/* 1. Grid Tab: Always visible */}
      <Tab.Screen 
        name="Category" 
        component={CategoryScreen} 
        options={{ title: 'Grid', tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />

      {/* Dynamic Module Tabs */}
      <Tab.Screen name="Map" component={MapScreen} options={getTabOptions('Map', 'RideO', Map)} />
      <Tab.Screen name="TestO" component={EcosystemWebView} initialParams={{ path: '/testo', moduleName: 'TestO' }} options={getTabOptions('TestO', 'TestO', BookOpen)} />
      <Tab.Screen name="TeachO" component={EcosystemWebView} initialParams={{ path: '/teacho', moduleName: 'TeachO' }} options={getTabOptions('TeachO', 'TeachO', BookOpen)} />
      <Tab.Screen name="TvO" component={EcosystemWebView} initialParams={{ path: '/tvo', moduleName: 'TvO' }} options={getTabOptions('TvO', 'TvO', MonitorPlay)} />
      <Tab.Screen name="MoneyO" component={EcosystemWebView} initialParams={{ path: '/moneyo', moduleName: 'MoneyO' }} options={getTabOptions('MoneyO', 'MoneyO', Wallet)} />

      {/* 4. AI Inbox Tab: Always visible */}
      <Tab.Screen 
        name="CRM" 
        component={ChatScreen} 
        options={{ title: 'Inbox', tabBarIcon: ({ color, size }) => <Bot color={color} size={size} /> }}
      />

      {/* 5. Profile Tab: Always visible */}
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f1e' } }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* Once logged in, go straight to Tabs (which defaults to Category) */}
          <Stack.Screen name="Dashboard" component={AppTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
