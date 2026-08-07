
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'main_layout.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/ride/screens/ride_screen.dart';
import 'module_webview.dart';
import '../features/gaming_hub/screens/gaming_hub_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import 'startup_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/startup',
    redirect: (context, state) {
      final bool loggedIn = authState.value?.session != null;
      final bool loggingIn = state.matchedLocation == '/login';
      final bool isStartup = state.matchedLocation == '/startup';

      if (!loggedIn) return '/login';
      // Do not redirect to /home if they are just opening the app and are already logged in
      if (loggingIn) return '/startup';
      return null;
    },
    routes: [
      GoRoute(path: '/startup', builder: (context, state) => const StartupScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
          GoRoute(path: '/ride', builder: (context, state) => const RideScreen()),
          GoRoute(path: '/admin', builder: (context, state) => const ModuleWebView(path: '/admin')),
          GoRoute(path: '/driveo', builder: (context, state) => const ModuleWebView(path: '/drivo')),
          GoRoute(path: '/dealo', builder: (context, state) => const ModuleWebView(path: '/dealo')),
          GoRoute(path: '/teacho', builder: (context, state) => const ModuleWebView(path: '/teacho')),
          GoRoute(path: '/rento', builder: (context, state) => const ModuleWebView(path: '/rento')),
          GoRoute(path: '/agro', builder: (context, state) => const ModuleWebView(path: '/agro')),
          GoRoute(path: '/touro', builder: (context, state) => const ModuleWebView(path: '/touro')),
          GoRoute(path: '/testo', builder: (context, state) => const ModuleWebView(path: '/testo')),
          GoRoute(path: '/tvo', builder: (context, state) => const ModuleWebView(path: '/tvo')),
          GoRoute(path: '/moneyo', builder: (context, state) => const ModuleWebView(path: '/moneyo')),
          GoRoute(path: '/gameo', builder: (context, state) => const ModuleWebView(path: '/gameo')),
          GoRoute(path: '/gaming_hub', builder: (context, state) => const GamingHubScreen()),
        ],
      ),
    ],
  );
});
