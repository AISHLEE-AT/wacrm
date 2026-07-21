import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../screens/module_selection_screen.dart';
import '../screens/setup_screen.dart';
import '../features/toolso/screens/toolso_dashboard.dart';
import '../features/rider/screens/home_screen.dart' as rider;
import '../features/driver/screens/home_screen.dart' as driver;

// Feature dashboards
import '../features/teacho/screens/teacho_dashboard.dart';
import '../features/teacho/screens/course_details_screen.dart';
import '../features/testo/screens/testo_dashboard.dart';
import '../features/testo/screens/test_details_screen.dart';
import '../features/touro/screens/touro_dashboard.dart';
import '../features/touro/screens/tour_details_screen.dart';
import '../features/moneyo/screens/moneyo_dashboard.dart';
import '../features/tasko/screens/tasko_dashboard.dart';


import '../features/tradeo/screens/tradeo_dashboard.dart';
import '../features/tradeo/screens/add_listing_screen.dart';
import '../features/tvo/screens/tvo_dashboard.dart';
import '../features/profile/screens/profile_dashboard.dart';

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
      
      if (authState.isLoading) return null; // Let the current screen handle loading or wait
      
      final isLoggingIn = state.uri.path == '/login';
      final isGuest = authState.role == UserRole.guest;

      if (isGuest) {
        ref.read(hasRoutedInitiallyProvider.notifier).state = false; // Reset on logout
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn) {
        return '/';
      }

      // Profile completion check
      if (!authState.isProfileComplete && state.uri.path != '/setup') {
        return '/setup';
      }

      // Default module routing logic for initial startup or login
      if (state.uri.path == '/' && !hasRoutedInitially) {
        ref.read(hasRoutedInitiallyProvider.notifier).state = true;
        if (authState.defaultModule != null && authState.defaultModule!.isNotEmpty) {
          return '/${authState.defaultModule!.toLowerCase()}';
        }
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
              return const ModuleSelectionScreen();
            },
          );
        },
      ),
      GoRoute(
        path: '/teacho',
        builder: (context, state) => const TeachODashboard(),
        routes: [
          GoRoute(
            path: 'course/:id',
            builder: (context, state) {
              final course = state.extra; // Access the CourseModel passed in extra
              return CourseDetailsScreen(course: course as dynamic);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/testo',
        builder: (context, state) => const TestODashboard(),
        routes: [
          GoRoute(
            path: 'test/:id',
            builder: (context, state) {
              final test = state.extra;
              return TestDetailsScreen(testModel: test as dynamic);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/touro',
        builder: (context, state) => const TourODashboard(),
        routes: [
          GoRoute(
            path: 'tour/:id',
            builder: (context, state) {
              final tour = state.extra;
              return TourDetailsScreen(touroModel: tour as dynamic);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/moneyo',
        builder: (context, state) => const MoneyODashboard(),
      ),
      GoRoute(
        path: '/tasko',
        builder: (context, state) => const TaskODashboard(),
      ),
      GoRoute(
        path: '/tvo',
        builder: (context, state) => const TvODashboard(),
      ),
      GoRoute(
        path: '/tradeo',
        builder: (context, state) => const TradeODashboard(),
        routes: [
          GoRoute(
            path: 'add',
            builder: (context, state) => const AddListingScreen(),
          ),
        ]
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
        path: '/toolso',
        builder: (context, state) => const ToolsODashboard(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileDashboard(),
      ),
    ],
  );
});
