import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';

import '../features/driver/screens/home_screen.dart' as driver;
import '../features/rider/screens/home_screen.dart' as rider;
import '../screens/superapp_main_screen.dart';

import '../features/driver/screens/driver_registration_screen.dart' as driver_reg;
import '../features/driver/screens/admin_home_screen.dart' as admin;

import '../features/onboarding/onboarding_provider.dart';
import '../features/onboarding/permissions_screen.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;
  RouterNotifier(this._ref) {
    _ref.listen(authProvider, (_, __) => notifyListeners());
    _ref.listen(onboardingProvider, (_, __) => notifyListeners());
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = RouterNotifier(ref);

  return GoRouter(
    initialLocation: '/permissions',
    refreshListenable: notifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final onboardingState = ref.read(onboardingProvider);
      
      final isLoggingIn = state.uri.path == '/login';
      final isPermissions = state.uri.path == '/permissions';
      final isRoot = state.uri.path == '/';

      if (authState.isLoading || onboardingState.isLoading) return null; // Keep current while loading

      final hasCompletedOnboarding = onboardingState.value ?? false;

      if (!hasCompletedOnboarding) {
        return isPermissions ? null : '/permissions';
      }

      if (isPermissions && hasCompletedOnboarding) {
        return '/'; // Let the subsequent logic handle it
      }

      if (authState.role == UserRole.guest) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn || isRoot) {
        if (authState.role == UserRole.admin) {
          return '/rider'; // Let admins test the rider app, they can access dashboard from drawer
        } else if (authState.role == UserRole.driver) {
          return '/driver';
        } else {
          return '/rider';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: CircularProgressIndicator(color: Color(0xFF00FF00)),
          ),
        ),
      ),
      GoRoute(
        path: '/permissions',
        builder: (context, state) => const PermissionsScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          // Default role is rider, no longer reading from query param since role selection is gone
          return const LoginScreen(role: 'rider');
        },
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
        builder: (context, state) => const SuperAppMainScreen(),
      ),
      GoRoute(
        path: '/driver/register',
        builder: (context, state) => const driver_reg.DriverRegistrationScreen(),
      ),
    ],
  );
});
