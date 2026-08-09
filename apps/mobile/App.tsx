// @ts-nocheck
import 'react-native-gesture-handler';
import React, { useContext, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import {
  BookOpen, MonitorPlay, Wallet, Map,
  MessageSquare, LayoutGrid, User, Bot,
  Shield, Tv, GraduationCap, ShoppingBag,
  Compass, Zap, Wrench, MapPin, Award, Gamepad2, Car
} from 'lucide-react-native';

const iconMap: Record<string, any> = {
  Map, MapPin, GraduationCap, Wrench, ShoppingBag, 
  Compass, Wallet, Tv, BookOpen, MonitorPlay, 
  Award, Shield, Bot, User, LayoutGrid, MessageSquare, Gamepad2, Car
};

import LoginScreen      from './src/screens/LoginScreen';
import CategoryScreen   from './src/screens/CategoryScreen';
import DashboardScreen  from './src/screens/DashboardScreen';
import EcosystemWebView from './src/screens/EcosystemWebView';
import MapScreen        from './src/screens/MapScreen';
import ChatScreen       from './src/screens/ChatScreen';
import RideOScreen      from './src/screens/RideOScreen';
import DriveOScreen     from './src/screens/DriveOScreen';
import GameOScreen      from './src/screens/GameOScreen';
import GamingHubScreen  from './src/screens/GamingHubScreen';
import RewardsScreen    from './src/screens/RewardsScreen';
import MapRacer3DScreen from './src/screens/MapRacer3DScreen';
import TeachOScreen     from './src/screens/TeachOScreen';
import TeachOCourseScreen from './src/screens/TeachOCourseScreen';
import TestOHubScreen   from './src/screens/TestOHubScreen';
import TestOExamScreen  from './src/screens/TestOExamScreen';
import TestOResultScreen from './src/screens/TestOResultScreen';
import AgrOScreen       from './src/screens/AgrOScreen';

import { AppProvider, AppContext } from './src/context/AppContext';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Shared tab options helper ─────────────────────────────────────────────
const tabOpts = (title: string, Icon: any) => ({
  title,
  tabBarIcon: ({ color, size }: any) => <Icon color={color} size={size} />,
});

// ─── Admin Bottom Tabs ─────────────────────────────────────────────────────
// Admin sees: Grid | WhatsApp CRM Inbox | Admin Dashboard | AI Assistant | Profile
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1526',
          borderTopColor: '#ef444430',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      {/* 1. Grid — all modules */}
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={tabOpts('Grid', LayoutGrid)}
      />

      {/* 2. WhatsApp CRM Inbox — admin only */}
      <Tab.Screen
        name="WhatsApp"
        component={EcosystemWebView}
        initialParams={{ path: '/inbox', moduleName: 'WhatsApp CRM' }}
        options={tabOpts('CRM Inbox', MessageSquare)}
      />

      {/* 3. Admin Overview Panel */}
      <Tab.Screen
        name="AdminPanel"
        component={EcosystemWebView}
        initialParams={{ path: '/admin', moduleName: 'Admin Panel' }}
        options={tabOpts('Admin', Shield)}
      />

      {/* 4. AI Assistant */}
      <Tab.Screen
        name="AIBot"
        component={ChatScreen}
        options={tabOpts('AI Assistant', Bot)}
      />

      {/* 5. Profile */}
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={tabOpts('Profile', User)}
      />
    </Tab.Navigator>
  );
}

// ─── User Bottom Tabs ──────────────────────────────────────────────────────
// Tailors Tab 2 dynamically based on user category (Driver -> DriveO, Student -> TeachO, Farmer -> AgrO, Shopper -> DealO, etc.)
function UserTabs() {
  const { recentModules } = useContext(AppContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1526',
          borderTopColor: '#10b98130',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      {/* 1. Grid — always first */}
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={tabOpts('Grid', LayoutGrid)}
      />

      {/* Dynamic Recent Modules */}
      {recentModules.map((mod: any, index: number) => {
        const IconComponent = iconMap[mod.iconName] || Map;
        const isAishleeModule = ['/teacho', '/testo', '/tvo', '/moneyo'].includes(mod.path);
        const aishleeUrl = isAishleeModule ? `https://thamizhan.vercel.app${mod.path}` : undefined;

        // Custom direct-screen mapping for some modules if needed, or fallback to EcosystemWebView
        // Actually for RideO, GameO, AgrO, TeachO we have dedicated screens, but the Tab Navigator handles the WebViews mainly, 
        // and screens are rendered by the stack navigator. Wait, the previous primaryModule just mapped to EcosystemWebView always.
        
        return (
          <Tab.Screen
            key={`tab-${mod.name}-${index}`}
            name={mod.name}
            component={EcosystemWebView}
            initialParams={{ 
              path: mod.path, 
              moduleName: mod.label,
              ...(aishleeUrl ? { url: aishleeUrl } : {})
            }}
            options={tabOpts(mod.label, IconComponent)}
          />
        );
      })}

      {/* Profile */}
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={tabOpts('Profile', User)}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator — decides Admin vs User tabs & dedicated ModuleView ─────
function RootNavigator() {
  const { isAdmin, isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#34d399" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0f1e' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Dashboard"
        component={isAdmin ? AdminTabs : UserTabs}
      />
      {/* Standalone module view screen for all grid items */}
      <Stack.Screen
        name="ModuleView"
        component={EcosystemWebView}
      />
      <Stack.Screen name="RideOScreen" component={RideOScreen} />
      <Stack.Screen name="DriveOScreen" component={DriveOScreen} />
      <Stack.Screen name="GameOScreen" component={GameOScreen} />
      <Stack.Screen name="MapRacer3DScreen" component={MapRacer3DScreen} />
      <Stack.Screen name="GamingHubScreen" component={GamingHubScreen} />
      <Stack.Screen name="RewardsScreen" component={RewardsScreen} />
      <Stack.Screen name="TeachOScreen" component={TeachOScreen} />
      <Stack.Screen name="TeachOCourseScreen" component={TeachOCourseScreen} />
      <Stack.Screen name="TestOHubScreen" component={TestOHubScreen} />
      <Stack.Screen name="TestOExamScreen" component={TestOExamScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TestOResultScreen" component={TestOResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AgrOScreen" component={AgrOScreen} />
    </Stack.Navigator>
  );
}

import { useNavigationContainerRef } from '@react-navigation/native';
import { supabase } from './src/lib/supabase';

function NavigationWrapper() {
  const { user } = useContext(AppContext);
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.getCurrentRoute();
        const currentRouteName = currentRoute?.name;
        
        if (currentRouteName && previousRouteName !== currentRouteName) {
           routeNameRef.current = currentRouteName;
           
           if (user?.phone) {
             let modulePath = null;
             if (currentRouteName === 'ModuleView' && currentRoute.params?.path) {
                modulePath = currentRoute.params.path;
             } else if (currentRouteName === 'DriveO' || currentRouteName === 'TeachO' || currentRouteName === 'AgrO' || currentRouteName === 'DealO' || currentRouteName === 'TourO' || currentRouteName === 'MoneyO' || currentRouteName === 'GameO') {
                // If they navigated via Bottom Tabs directly
                const routeParams = currentRoute.params as any;
                if (routeParams?.path) modulePath = routeParams.path;
             } else if (currentRouteName === 'GameOScreen') {
                modulePath = '/gameo';
             } else if (currentRouteName === 'AgrOScreen') {
                modulePath = '/agro';
             } else if (currentRouteName === 'TeachOScreen') {
                modulePath = '/teacho';
             }

             if (modulePath) {
               supabase.from('profiles').update({ default_module: modulePath }).eq('phone', user.phone).then(()=>{}).catch(()=>{});
             }
           }
        }
      }}
    >
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

// ─── App root ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <NavigationWrapper />
    </AppProvider>
  );
}
