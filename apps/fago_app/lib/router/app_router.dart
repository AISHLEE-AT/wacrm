import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';

// Assuming these exist from the copied folders:
import '../features/driver/screens/home_screen.dart' as driver;
import '../features/rider/screens/home_screen.dart' as rider;
import '../features/driver/screens/admin_home_screen.dart' as admin;
import '../features/driver/screens/driver_registration_screen.dart' as driver_reg;

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';

      if (authState.isLoading) return null; // Keep current while loading

      if (authState.role == UserRole.guest) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn) {
        switch (authState.role) {
          case UserRole.admin:
            return '/admin';
          case UserRole.driver:
            return '/driver';
          case UserRole.rider:
            return '/rider';
          case UserRole.guest:
            return '/login';
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
        path: '/admin',
        builder: (context, state) => const admin.AdminHomeScreen(),
      ),
      GoRoute(
        path: '/driver',
        builder: (context, state) => const driver.HomeScreen(),
      ),
      GoRoute(
        path: '/rider',
        builder: (context, state) => const rider.HomeScreen(),
      ),
      GoRoute(
        path: '/driver/register',
        builder: (context, state) => const driver_reg.DriverRegistrationScreen(),
      ),
    ],
  );
});
