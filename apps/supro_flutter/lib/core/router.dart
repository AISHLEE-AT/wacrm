
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/ride/screens/ride_screen.dart';
import '../features/admin/screens/admin_screen.dart';
import '../features/driveo/screens/driveo_screen.dart';
import '../features/dealo/screens/dealo_screen.dart';
import '../features/teacho/screens/teacho_screen.dart';
import '../features/rento/screens/rento_screen.dart';
import '../features/agro/screens/agro_screen.dart';
import '../features/touro/screens/touro_screen.dart';
import '../features/testo/screens/testo_screen.dart';
import '../features/tvo/screens/tvo_screen.dart';
import '../features/moneyo/screens/moneyo_screen.dart';
import '../features/auth/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final bool loggedIn = authState.value?.session != null;
      final bool loggingIn = state.matchedLocation == '/login';

      if (!loggedIn) return '/login';
      if (loggingIn) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
      GoRoute(path: '/ride', builder: (context, state) => const RideScreen()),
      GoRoute(path: '/admin', builder: (context, state) => const AdminScreen()),
      GoRoute(path: '/driveo', builder: (context, state) => const DriveoScreen()),
      GoRoute(path: '/dealo', builder: (context, state) => const DealoScreen()),
      GoRoute(path: '/teacho', builder: (context, state) => const TeachoScreen()),
      GoRoute(path: '/rento', builder: (context, state) => const RentoScreen()),
      GoRoute(path: '/agro', builder: (context, state) => const AgroScreen()),
      GoRoute(path: '/touro', builder: (context, state) => const TouroScreen()),
      GoRoute(path: '/testo', builder: (context, state) => const TestoScreen()),
      GoRoute(path: '/tvo', builder: (context, state) => const TvoScreen()),
      GoRoute(path: '/moneyo', builder: (context, state) => const MoneyoScreen()),
    ],
  );
});
