// @ts-nocheck
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
  Compass, Zap, Wrench, MapPin
} from 'lucide-react-native';

import LoginScreen      from './src/screens/LoginScreen';
import CategoryScreen   from './src/screens/CategoryScreen';
import DashboardScreen  from './src/screens/DashboardScreen';
import EcosystemWebView from './src/screens/EcosystemWebView';
import DriveOScreen     from './src/screens/DriveOScreen';
import RideOScreen      from './src/screens/RideOScreen';
import MapScreen        from './src/screens/MapScreen';
import AishleeToolsScreen from './src/screens/AishleeToolsScreen';
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

import OnboardingPermissionsScreen from './src/screens/OnboardingPermissionsScreen';
import OnboardingProfileScreen from './src/screens/OnboardingProfileScreen';
import OnboardingModuleScreen from './src/screens/OnboardingModuleScreen';

import { AppProvider, AppContext } from './src/context/AppContext';
import { LocationProvider } from './src/context/LocationContext';

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
// Tailors Tab 2 dynamically based on user category (Driver -> DriveO, Student -> TeachO, Farmer -> AgrO, Shopper -> DealO, etc.)
function UserTabs() {
  const { user } = useContext(AppContext);
  const category = (user?.category || user?.role || '').toLowerCase();
  const defaultModulePath = user?.defaultModule;

  let primaryModule: {
    name: string;
    path: string;
    label: string;
    icon: any;
    nativeComponent?: any;
  } = {
    name: 'PrimaryModule',
    path: '/rideo',
    label: 'RideO',
    icon: Map,
    nativeComponent: RideOScreen,
  };

  const selectedPath = user?.selectedModule || defaultModulePath;

  // First try to match selectedModule / defaultModule if available
  if (selectedPath === '/drivo') {
    primaryModule = { name: 'DriveO', path: '/drivo', label: 'DriveO', icon: MapPin, nativeComponent: DriveOScreen };
  } else if (selectedPath === '/teacho') {
    primaryModule = { name: 'TeachO', path: '/teacho', label: 'TeachO', icon: GraduationCap, nativeComponent: TeachOScreen };
  } else if (selectedPath === '/agro') {
    primaryModule = { name: 'AgrO', path: '/agro', label: 'AgrO', icon: Wrench, nativeComponent: AgrOScreen };
  } else if (selectedPath === '/dealo') {
    primaryModule = { name: 'DealO', path: '/dealo', label: 'DealO', icon: ShoppingBag };
  } else if (selectedPath === '/touro') {
    primaryModule = { name: 'TourO', path: '/touro', label: 'TourO', icon: Compass };
  } else if (selectedPath === '/moneyo') {
    primaryModule = { name: 'MoneyO', path: '/moneyo', label: 'MoneyO', icon: Wallet };
  } else if (selectedPath === '/gameo') {
    primaryModule = { name: 'GameO', path: '/gameo', label: 'GameO', icon: Map, nativeComponent: GameOScreen }; 
  } else if (selectedPath === '/rento') {
    primaryModule = { name: 'RentO', path: '/rento', label: 'RentO', icon: Compass }; // fallback icon
  } else if (selectedPath === '/testo') {
    primaryModule = { name: 'TestO', path: '/testo', label: 'TestO', icon: GraduationCap, nativeComponent: TestOHubScreen }; // fallback icon
  } else if (selectedPath === '/tvo') {
    primaryModule = { name: 'TvO', path: '/tvo', label: 'TvO', icon: Tv }; 
  } else {
    // Fallback to category-based logic
    if (category.includes('driver')) {
      primaryModule = { name: 'DriveO', path: '/drivo', label: 'DriveO', icon: MapPin, nativeComponent: DriveOScreen };
    } else if (category.includes('student') || category.includes('teacher') || category.includes('jobseeker')) {
      primaryModule = { name: 'TeachO', path: '/teacho', label: 'TeachO', icon: GraduationCap, nativeComponent: TeachOScreen };
    } else if (category.includes('farmer') || category.includes('agri')) {
      primaryModule = { name: 'AgrO', path: '/agro', label: 'AgrO', icon: Wrench, nativeComponent: AgrOScreen };
    } else if (category.includes('shopper') || category.includes('merchant')) {
      primaryModule = { name: 'DealO', path: '/dealo', label: 'DealO', icon: ShoppingBag };
    } else if (category.includes('tourist')) {
      primaryModule = { name: 'TourO', path: '/touro', label: 'TourO', icon: Compass };
    } else if (category.includes('financier')) {
      primaryModule = { name: 'MoneyO', path: '/moneyo', label: 'MoneyO', icon: Wallet };
    }
  }

  const isAishleeModule = ['/teacho', '/testo', '/tvo', '/moneyo'].includes(primaryModule.path);
  const aishleeUrl = isAishleeModule ? `https://thamizhan.vercel.app${primaryModule.path}` : undefined;

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

      {/* 2. User's Tailored Primary Module */}
      {primaryModule.nativeComponent ? (
        <Tab.Screen
          name={primaryModule.name}
          component={primaryModule.nativeComponent}
          options={tabOpts(primaryModule.label, primaryModule.icon)}
        />
      ) : (
        <Tab.Screen
          name={primaryModule.name}
          component={EcosystemWebView}
          initialParams={{ 
            path: primaryModule.path, 
            moduleName: primaryModule.label,
            ...(aishleeUrl ? { url: aishleeUrl } : {})
          }}
          options={tabOpts(primaryModule.label, primaryModule.icon)}
        />
      )}

      {/* 3. AI Assistant */}
      <Tab.Screen
        name="AIBot"
        component={AishleeToolsScreen}
        options={tabOpts('AI Hub', Bot)}
      />

      {/* 4. Profile */}
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
      <LocationProvider>
        <NavigationWrapper />
      </LocationProvider>
    </AppProvider>
  );
}
