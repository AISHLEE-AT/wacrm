import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, MonitorPlay, Wallet, Home, Map } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EcosystemWebView from './src/screens/EcosystemWebView';
import MapScreen from './src/screens/MapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// The Bottom Tabs for the ecosystem modules
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'Live Map', tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="TestO" 
        component={EcosystemWebView} 
        initialParams={{ path: '/testo', moduleName: 'TestO' }}
        options={{ tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="TeachO" 
        component={EcosystemWebView} 
        initialParams={{ path: '/teacho', moduleName: 'TeachO' }}
        options={{ tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="TvO" 
        component={EcosystemWebView} 
        initialParams={{ path: '/tvo', moduleName: 'TvO' }}
        options={{ tabBarIcon: ({ color, size }) => <MonitorPlay color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="MoneyO" 
        component={EcosystemWebView} 
        initialParams={{ path: '/moneyo', moduleName: 'MoneyO' }}
        options={{ tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f1e' } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Once logged in, switch to the Tabs */}
        <Stack.Screen name="Dashboard" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
