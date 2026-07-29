import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../screens/crm_dashboard_screen.dart';
import '../screens/setup_screen.dart';
import '../features/rider/screens/home_screen.dart' as rider;
import '../features/driver/screens/home_screen.dart' as driver;
import '../features/driver/screens/admin_home_screen.dart' as admin;
import '../features/profile/screens/profile_dashboard.dart';

import '../screens/rider_map_screen.dart';
import '../screens/driver_dashboard_screen.dart';

import '../screens/rento_screen.dart';
import '../screens/mandi_prices_screen.dart';
import '../screens/touro_screen.dart';
import '../screens/teacho_screen.dart';

final hasRoutedInitiallyProvider = StateProvider<bool>((ref) => false);

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
      final hasRoutedInitially = ref.read(hasRoutedInitiallyProvider);

      if (authState.isLoading) return null;

      // Direct all mobile entry straight to CrmDashboardScreen (WebView)
      // Authentication is handled seamlessly ONCE via web session persistence.
      if (state.uri.path == '/' && !hasRoutedInitially) {
        ref.read(hasRoutedInitiallyProvider.notifier).state = true;
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
                  body: Center(
                    child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                  ),
                );
              }
              // All authenticated users go straight to the WhatsApp CRM
              return const CrmDashboardScreen();
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
        builder: (context, state) => const admin.AdminHomeScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileDashboard(),
      ),
    ],
  );
});
