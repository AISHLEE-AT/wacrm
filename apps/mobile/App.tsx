// @ts-nocheck
import React, { useContext, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BookOpen, MonitorPlay, Wallet, Map,
  MessageSquare, LayoutGrid, User, Bot,
  Shield, Tv, GraduationCap, ShoppingBag,
  Compass, Zap, Wrench, MapPin, Car, Gamepad2, Award
} from 'lucide-react-native';

import LoginScreen      from './src/screens/LoginScreen';
import CategoryScreen   from './src/screens/CategoryScreen';
import DashboardScreen  from './src/screens/DashboardScreen';
import EcosystemWebView from './src/screens/EcosystemWebView';
import DriveOScreen     from './src/screens/DriveOScreen';
import RideOScreen      from './src/screens/RideOScreen';
import AishleeToolsScreen from './src/screens/AishleeToolsScreen';
import TeachOScreen     from './src/screens/TeachOScreen';
import TeachOCourseScreen from './src/screens/TeachOCourseScreen';
import TestOHubScreen   from './src/screens/TestOHubScreen';
import TestOExamScreen  from './src/screens/TestOExamScreen';
import TestOResultScreen from './src/screens/TestOResultScreen';
import CareerHubScreen  from './src/screens/CareerHubScreen';
import AgrOScreen       from './src/screens/AgrOScreen';
import RentOScreen      from './src/screens/RentOScreen';
import DealOScreen      from './src/screens/DealOScreen';
import FlowQuestionScreen from './src/screens/FlowQuestionScreen';

import OnboardingPermissionsScreen from './src/screens/OnboardingPermissionsScreen';
import OnboardingProfileScreen from './src/screens/OnboardingProfileScreen';
import OnboardingModuleScreen from './src/screens/OnboardingModuleScreen';

import { AppProvider, AppContext } from './src/context/AppContext';
import { LocationProvider } from './src/context/LocationContext';
import { colors } from './src/lib/theme';

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
  const { themeVer } = useContext(AppContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
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
        component={AishleeToolsScreen}
        options={tabOpts('AI Hub', Bot)}
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
// Dynamically tailors bottom tabs based on user category (e.g. Driver -> DriveO + RideO, Farmer -> AgrO + RentO, Student -> TeachO + TestO, etc.)
function UserTabs() {
  const { user, pinnedModules, themeVer } = useContext(AppContext);
  const category = (user?.category || user?.role || 'Traveller').toLowerCase();

  const getModuleConfig = (id: string) => {
    switch (id) {
      case 'driveo': return { name: 'DriveOTab', path: '/drivo', label: 'DriveO', icon: MapPin, nativeComponent: DriveOScreen };
      case 'rideo': return { name: 'RideOTab', path: '/rideo', label: 'RideO', icon: Car, nativeComponent: RideOScreen };
      case 'teacho': return { name: 'TeachOTab', path: '/teacho', label: 'TeachO', icon: GraduationCap, nativeComponent: TeachOScreen };
      case 'agro': return { name: 'AgrOTab', path: '/agro', label: 'AgrO', icon: Wrench, nativeComponent: AgrOScreen };
      case 'dealo': return { name: 'DealOTab', path: '/dealo', label: 'DealO', icon: ShoppingBag, nativeComponent: DealOScreen };
      case 'touro': return { name: 'TourOTab', path: '/touro', label: 'TourO', icon: Compass };
      case 'moneyo': return { name: 'MoneyOTab', path: '/moneyo', label: 'MoneyO', icon: Wallet };
      case 'rento': return { name: 'RentOTab', path: '/rento', label: 'RentO', icon: Wrench, nativeComponent: RentOScreen };
      case 'testo': return { name: 'TestOTab', path: '/testo', label: 'TestO', icon: Award, nativeComponent: TestOHubScreen };
      default: return null;
    }
  };

  const renderModScreen = (mod: any) => {
    if (!mod) return null;
    const isAishleeModule = ['/teacho', '/testo', '/tvo', '/moneyo'].includes(mod.path);
    const aishleeUrl = isAishleeModule ? `https://thamizhan.vercel.app${mod.path}` : undefined;

    if (mod.nativeComponent) {
      return (
        <Tab.Screen
          key={mod.name}
          name={mod.name}
          component={mod.nativeComponent}
          options={tabOpts(mod.label, mod.icon)}
        />
      );
    }
    return (
      <Tab.Screen
        key={mod.name}
        name={mod.name}
        component={EcosystemWebView}
        initialParams={{
          path: mod.path,
          moduleName: mod.label,
          ...(aishleeUrl ? { url: aishleeUrl } : {}),
        }}
        options={tabOpts(mod.label, mod.icon)}
      />
    );
  };

  // Determine category-specific primary and related module
  let primaryModId = 'rideo';
  let relatedModId = 'touro';

  if (category.includes('driver')) {
    primaryModId = 'driveo';
    relatedModId = 'rideo';
  } else if (category.includes('partner')) {
    primaryModId = 'dealo';
    relatedModId = 'rento';
  } else if (category.includes('farmer') || category.includes('agri')) {
    primaryModId = 'agro';
    relatedModId = 'rento';
  } else if (category.includes('student') || category.includes('learner') || category.includes('candidate')) {
    primaryModId = 'teacho';
    relatedModId = 'testo';
  } else if (category.includes('teacher') || category.includes('tutor')) {
    primaryModId = 'teacho';
    relatedModId = 'testo';
  } else if (category.includes('shopper') || category.includes('merchant')) {
    primaryModId = 'dealo';
    relatedModId = 'moneyo';
  } else if (category.includes('financier')) {
    primaryModId = 'moneyo';
    relatedModId = 'dealo';
  } else if (category.includes('tourist')) {
    primaryModId = 'touro';
    relatedModId = 'rideo';
  } else {
    // Default Traveller
    primaryModId = 'rideo';
    relatedModId = 'touro';
  }

  // If user has pinned specific modules, respect them
  if (pinnedModules && pinnedModules.length > 0) {
    primaryModId = pinnedModules[0];
    if (pinnedModules.length > 1) {
      relatedModId = pinnedModules[1];
    }
  }

  const primaryMod = getModuleConfig(primaryModId);
  const relatedMod = getModuleConfig(relatedModId);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {/* 1. Primary Module for Category */}
      {renderModScreen(primaryMod)}

      {/* 2. Related Module for Category */}
      {renderModScreen(relatedMod)}

      {/* 3. AI Assistant Tools Hub */}
      <Tab.Screen
        name="AIBot"
        component={AishleeToolsScreen}
        options={tabOpts('AI Hub', Bot)}
      />

      {/* 4. Profile — user settings & category selector */}
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
  const { user, isAdmin, isLoading, themeMode, themeVer } = useContext(AppContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const initialRoute = user?.phone ? 'Dashboard' : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissionsScreen} />
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingModule" component={OnboardingModuleScreen} />
      <Stack.Screen
        name="Dashboard"
        component={isAdmin ? AdminTabs : UserTabs}
      />
      {/* Standalone module view screen for all grid items */}
      <Stack.Screen
        name="ModuleView"
        component={EcosystemWebView}
      />
      <Stack.Screen name="DriveOScreen" component={DriveOScreen} />
      <Stack.Screen name="RideOScreen" component={RideOScreen} />
      <Stack.Screen name="AishleeToolsScreen" component={AishleeToolsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TeachOScreen" component={TeachOScreen} />
      <Stack.Screen name="TeachOCourseScreen" component={TeachOCourseScreen} />
      <Stack.Screen name="TestOHubScreen" component={TestOHubScreen} />
      <Stack.Screen name="TestOExamScreen" component={TestOExamScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TestOResultScreen" component={TestOResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CareerHubScreen" component={CareerHubScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AgrOScreen" component={AgrOScreen} />
      <Stack.Screen name="RentOScreen" component={RentOScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealOScreen" component={DealOScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DealO" component={DealOScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlowQuestionScreen" component={FlowQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Flow" component={FlowQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={{ headerShown: true, title: 'All Modules', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }} />
    </Stack.Navigator>
  );
}

import { useNavigationContainerRef } from '@react-navigation/native';
import { supabase } from './src/lib/supabase';

function NavigationWrapper() {
  const { user, themeMode } = useContext(AppContext);
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
             } else if (currentRouteName === 'DriveO' || currentRouteName === 'TeachO' || currentRouteName === 'AgrO' || currentRouteName === 'DealO' || currentRouteName === 'TourO' || currentRouteName === 'MoneyO') {
                // If they navigated via Bottom Tabs directly
                const routeParams = currentRoute.params as any;
                if (routeParams?.path) modulePath = routeParams.path;
             } else if (currentRouteName === 'AgrOScreen') {
                modulePath = '/agro';
             } else if (currentRouteName === 'TeachOScreen') {
                modulePath = '/teacho';
             } else if (currentRouteName === 'DealOScreen' || currentRouteName === 'DealO') {
                modulePath = '/dealo';
             }

             if (modulePath) {
               supabase.from('profiles').update({ default_module: modulePath }).eq('phone', user.phone).then(()=>{}).catch(()=>{});
             }
           }
        }
      }}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

import AppStartupPermissionModal from './src/components/AppStartupPermissionModal';

// ─── App root ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <LocationProvider>
          <NavigationWrapper />
          <AppStartupPermissionModal />
        </LocationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
