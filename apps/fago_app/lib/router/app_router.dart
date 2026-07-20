import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';

import '../features/driver/screens/home_screen.dart' as driver;
import '../features/driver/screens/driver_registration_screen.dart' as driver_reg;
import '../features/driver/screens/admin_home_screen.dart' as admin;

import '../screens/superapp_main_screen.dart';
import '../screens/module_selection_screen.dart';

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
    initialLocation: '/superapp',
    refreshListenable: notifier,
    redirect: (context, state) {
      // Always allow navigation; Web app handles auth internally via WebView
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
          ),
        ),
      ),
      GoRoute(
        path: '/permissions',
        builder: (context, state) => const PermissionsScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(role: 'rider'),
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
        // Module selector: user picks which module to open
        builder: (context, state) => const ModuleSelectionScreen(),
      ),
      GoRoute(
        path: '/superapp',
        builder: (context, state) {
          // 'url' param = exact module URL (e.g. https://watscrm.vercel.app/teacho)
          // Only THAT page loads — zero egress for unvisited modules
          final url = state.uri.queryParameters['url'];
          // Legacy tab-based support
          final tab = state.uri.queryParameters['tab'];
          return SuperAppMainScreen(
            initialUrl: url != null ? Uri.decodeComponent(url) : null,
            initialIndex: tab != null ? int.tryParse(tab) ?? 0 : 0,
          );
        },
      ),
      GoRoute(
        path: '/driver/register',
        builder: (context, state) => const driver_reg.DriverRegistrationScreen(),
      ),
    ],
  );
});
