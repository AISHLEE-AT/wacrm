import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'main_layout.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/ride/screens/ride_screen.dart';
import '../features/driveo/screens/driveo_screen.dart';
import '../features/rento/screens/rento_screen.dart';
import '../features/admin/screens/admin_screen.dart';
import '../features/agro/screens/agro_screen.dart';
import '../features/dealo/screens/dealo_screen.dart';
import '../features/teacho/screens/teacho_screen.dart';
import '../features/teacho/screens/tuto_admin_screen.dart';
import '../features/testo/screens/testo_screen.dart';
import '../features/touro/screens/touro_screen.dart';
import '../features/tvo/screens/tvo_screen.dart';
import '../features/moneyo/screens/moneyo_screen.dart';
import '../features/gameo/screens/gameo_screen.dart';
import '../features/gaming_hub/screens/gaming_hub_screen.dart';
import '../features/ai_hub/screens/ai_hub_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import 'startup_screen.dart';
import '../features/onboarding/screens/biometric_setup_screen.dart';
import '../features/onboarding/screens/permissions_screen.dart';
import '../features/onboarding/screens/profile_setup_screen.dart';
import '../features/onboarding/screens/module_selector_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/startup',
    redirect: (context, state) {
      final bool loggedIn = (authState.value?.session != null) ||
          (Supabase.instance.client.auth.currentSession != null);
      final bool loggingIn = state.matchedLocation == '/login';
      final bool isStartup = state.matchedLocation == '/startup';

      if (!loggedIn) return '/login';
      if (loggingIn) return '/startup';
      return null;
    },
    routes: [
      GoRoute(path: '/startup', builder: (context, state) => const StartupScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/onboarding/biometric', builder: (_, __) => const BiometricSetupScreen()),
      GoRoute(path: '/onboarding/permissions', builder: (_, __) => const PermissionsScreen()),
      GoRoute(path: '/onboarding/profile', builder: (_, __) => const ProfileSetupScreen()),
      GoRoute(path: '/onboarding/modules', builder: (_, __) => const ModuleSelectorScreen()),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
          GoRoute(path: '/ride', builder: (context, state) => const RideScreen()),
          GoRoute(path: '/driveo', builder: (context, state) => const DriveoScreen()),
          GoRoute(path: '/rento', builder: (context, state) => const RentoScreen()),
          GoRoute(path: '/admin', builder: (context, state) => const AdminScreen()),
          GoRoute(path: '/dealo', builder: (context, state) => const DealoScreen()),
          GoRoute(path: '/teacho', builder: (context, state) => const TeachoScreen()),
          GoRoute(path: '/tuto_admin', builder: (context, state) => const TutOAdminScreen()),
          GoRoute(path: '/agro', builder: (context, state) => const AgroScreen()),
          GoRoute(path: '/touro', builder: (context, state) => const TouroScreen()),
          GoRoute(path: '/testo', builder: (context, state) => const TestoScreen()),
          GoRoute(path: '/tvo', builder: (context, state) => const TvoScreen()),
          GoRoute(path: '/moneyo', builder: (context, state) => const MoneyoScreen()),
          GoRoute(path: '/gameo', builder: (context, state) => const GameoScreen()),
          GoRoute(path: '/gaming_hub', builder: (context, state) => const GamingHubScreen()),
          GoRoute(path: '/ai_hub', builder: (context, state) => const AiHubScreen()),
        ],
      ),
    ],
  );
});
