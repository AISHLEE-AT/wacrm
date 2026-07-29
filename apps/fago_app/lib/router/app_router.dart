import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../screens/crm_dashboard_screen.dart';
import '../screens/setup_screen.dart';
import '../features/rider/screens/home_screen.dart' as rider;
import '../features/driver/screens/home_screen.dart' as driver;
import '../features/profile/screens/profile_dashboard.dart';

import '../screens/rider_map_screen.dart';
import '../screens/driver_dashboard_screen.dart';
import '../screens/admin_crm_screen.dart';
import '../screens/web_module_screen.dart';
import '../features/dealo/screens/dealo_marketplace_screen.dart';

import '../screens/rento_screen.dart';
import '../screens/mandi_prices_screen.dart';
import '../screens/touro_screen.dart';
import '../screens/teacho_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Use a ValueNotifier to trigger redirects without rebuilding GoRouter
  final notifier = ValueNotifier<AuthState>(ref.read(authProvider));
  ref.listen<AuthState>(authProvider, (_, next) {
    notifier.value = next;
  });

  return GoRouter(
    refreshListenable: notifier,
    initialLocation: '/',
    redirect: (context, state) {
      final authState = notifier.value;
      if (authState.isLoading) return null;

      final isLoggingIn = state.uri.path == '/login';
      final isLoggedIn = authState.role != UserRole.guest;

      // 1. If not logged in and not on /login, redirect to /login
      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }

      // 2. If logged in and on /login, redirect to home '/'
      if (isLoggedIn && isLoggingIn) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/setup',
        builder: (context, state) => const SetupScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) {
          return Consumer(
            builder: (context, ref, _) {
              final authState = ref.watch(authProvider);
              if (authState.isLoading) {
                return const Scaffold(
                  backgroundColor: Color(0xFF0F172A),
                  body: Center(
                    child: CircularProgressIndicator(color: Color(0xFF00FF00)),
                  ),
                );
              }
              if (authState.role == UserRole.guest) {
                return const LoginScreen();
              }
              if (authState.role == UserRole.admin) {
                return const CrmDashboardScreen();
              }
              if (authState.role == UserRole.driver) {
                return const DriverDashboardScreen();
              }
              // Standard User Category Dynamic Routing
              switch (authState.mainCategory) {
                case 'Farmer':
                  return const RentOScreen();
                case 'Shopper':
                case 'Financier':
                  return const MandiPricesScreen();
                case 'Tourist':
                  return const TourOScreen();
                case 'Teacher':
                case 'Student':
                  return const TeachOScreen();
                default:
                  return const RiderMapScreen();
              }
            },
          );
        },
      ),
      GoRoute(
        path: '/rideo',
        builder: (context, state) => const RiderMapScreen(),
      ),
      GoRoute(
        path: '/drivo',
        builder: (context, state) => const DriverDashboardScreen(),
      ),
      GoRoute(
        path: '/rento',
        builder: (context, state) => const RentOScreen(),
      ),
      GoRoute(
        path: '/mandi',
        builder: (context, state) => const MandiPricesScreen(),
      ),
      GoRoute(
        path: '/touro',
        builder: (context, state) => const TourOScreen(),
      ),
      GoRoute(
        path: '/teacho',
        builder: (context, state) => const TeachOScreen(),
      ),
      GoRoute(
        path: '/rider',
        builder: (context, state) => const rider.HomeScreen(),
      ),
      GoRoute(
        path: '/driver',
        builder: (context, state) => const driver.HomeScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminCrmScreen(),
      ),
      GoRoute(
        path: '/dealo',
        builder: (context, state) => const DealoMarketplaceScreen(),
      ),
      GoRoute(
        path: '/testo',
        builder: (context, state) => const WebModuleScreen(title: 'TestO (Exam Hub)', modulePath: '/testo'),
      ),
      GoRoute(
        path: '/tvo',
        builder: (context, state) => const WebModuleScreen(title: 'TvO (Video Guides)', modulePath: '/tvo'),
      ),
      GoRoute(
        path: '/gemini',
        builder: (context, state) => const WebModuleScreen(title: 'Gemini AI Assistant', modulePath: '/gemini'),
      ),
      GoRoute(
        path: '/moneyo',
        builder: (context, state) => const WebModuleScreen(title: 'MoneyO (Finance)', modulePath: '/moneyo'),
      ),
      GoRoute(
        path: '/tasko',
        builder: (context, state) => const WebModuleScreen(title: 'TaskO (Gig Work)', modulePath: '/tasko'),
      ),
      GoRoute(
        path: '/toolso',
        builder: (context, state) => const WebModuleScreen(title: 'AI & ToolsO Suite', modulePath: '/toolso'),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileDashboard(),
      ),
    ],
  );
});
