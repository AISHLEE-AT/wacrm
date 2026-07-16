import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../features/driver/screens/role_selection_screen.dart';

import '../features/driver/screens/home_screen.dart' as driver;
import '../features/rider/screens/home_screen.dart' as rider;

import '../features/driver/screens/driver_registration_screen.dart' as driver_reg;

import '../features/onboarding/onboarding_provider.dart';
import '../features/onboarding/permissions_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  final onboardingState = ref.watch(onboardingProvider);

  return GoRouter(
    initialLocation: '/permissions',
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isSelectingRole = state.uri.path == '/role';
      final isPermissions = state.uri.path == '/permissions';
      final isRoot = state.uri.path == '/';

      if (authState.isLoading || onboardingState.isLoading) return null; // Keep current while loading

      final hasCompletedOnboarding = onboardingState.value ?? false;

      if (!hasCompletedOnboarding) {
        return isPermissions ? null : '/permissions';
      }

      if (isPermissions && hasCompletedOnboarding) {
        return '/role';
      }

      if (authState.role == UserRole.guest) {
        return (isLoggingIn || isSelectingRole) ? null : '/role';
      }

      if (isLoggingIn || isSelectingRole || isRoot) {
        switch (authState.role) {
          case UserRole.admin:
            return '/rider';
          case UserRole.driver:
            return '/driver';
          case UserRole.rider:
            return '/rider';
          case UserRole.guest:
            return '/role';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/permissions',
        builder: (context, state) => const PermissionsScreen(),
      ),
      GoRoute(
        path: '/role',
        builder: (context, state) => const RoleSelectionScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          // Read role from query parameters
          final role = state.uri.queryParameters['role'] ?? 'rider';
          return LoginScreen(role: role);
        },
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
