import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import '../auth/pin_setup_screen.dart';
import '../screens/crm_dashboard_screen.dart';
import '../screens/setup_screen.dart';
import '../features/rider/screens/home_screen.dart' as rider;
import '../features/driver/screens/home_screen.dart' as driver;
import '../screens/admin_crm_screen.dart';
import '../features/profile/screens/profile_dashboard.dart';

import '../screens/rider_map_screen.dart';
import '../screens/driver_dashboard_screen.dart';

import '../screens/rento_screen.dart';
import '../screens/mandi_prices_screen.dart';
import '../screens/touro_screen.dart';
import '../screens/teacho_screen.dart';
import '../screens/testo_screen.dart';
import '../screens/tvo_screen.dart';
import '../screens/web_module_screen.dart';
import '../screens/gemini_ai_assistant_screen.dart';
import '../features/dealo/screens/dealo_marketplace_screen.dart';
import '../features/promo/screens/whatsapp_status_promo_screen.dart';
import '../services/device_auth_service.dart';

/// Tracks whether PIN setup has been completed this session.
final pinSetupCompleteProvider = FutureProvider<bool>((ref) async {
  final pin = await DeviceAuthService.getCustomFagoPin();
  return pin != null && pin.isNotEmpty;
});

final hasRoutedInitiallyProvider = StateProvider<bool>((ref) => false);

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ValueNotifier<AuthState>(ref.read(authProvider));
  ref.listen<AuthState>(authProvider, (_, next) {
    notifier.value = next;
  });

  return GoRouter(
    refreshListenable: notifier,
    initialLocation: '/',
    redirect: (context, state) {
      final authState = notifier.value;
      final currentPath = state.uri.path;

      if (authState.isLoading) return null;


      if (authState.role == UserRole.guest) {
        return currentPath == '/login' ? null : '/login';
      }

      // Role-based guards for admin routes
      if ((currentPath == '/admin' || currentPath == '/admino' || currentPath == '/crm') &&
          authState.role != UserRole.admin) {
        return authState.role == UserRole.driver ? '/drivo' : '/rideo';
      }

      if (currentPath == '/login') {
        if (authState.role == UserRole.admin) {
          return '/admin';
        } else if (authState.role == UserRole.driver) {
          return '/drivo';
        } else {
          return '/rideo';
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
        path: '/pin-setup',
        builder: (context, state) => const PinSetupScreen(),
      ),
      GoRoute(
        path: '/pin-check',
        builder: (context, state) {
          return Consumer(
            builder: (context, ref, _) {
              final pinStatus = ref.watch(pinSetupCompleteProvider);
              return pinStatus.when(
                data: (hasPinSetup) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (!hasPinSetup) {
                      context.go('/pin-setup');
                    } else {
                      context.go('/');
                    }
                  });
                  return const Scaffold(
                    backgroundColor: Color(0xFF0A0A0A),
                    body: Center(
                      child: CircularProgressIndicator(color: Color(0xFF00FF00)),
                    ),
                  );
                },
                loading: () => const Scaffold(
                  backgroundColor: Color(0xFF0A0A0A),
                  body: Center(
                    child: CircularProgressIndicator(color: Color(0xFF00FF00)),
                  ),
                ),
                error: (e, st) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    context.go('/');
                  });
                  return const SizedBox();
                },
              );
            },
          );
        },
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
                  backgroundColor: Color(0xFF0A0A0A),
                  body: Center(
                    child: CircularProgressIndicator(color: Color(0xFF00FF00)),
                  ),
                );
              }

              if (authState.role == UserRole.guest) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  context.go('/login');
                });
                return const SizedBox();
              }

              // Role-based root routing: Admin -> CrmDashboardScreen, Driver -> DriverDashboardScreen, User -> RiderMapScreen
              if (authState.role == UserRole.admin) {
                return const CrmDashboardScreen();
              } else if (authState.role == UserRole.driver) {
                return const DriverDashboardScreen();
              } else {
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
        path: '/testo',
        builder: (context, state) => const TestOScreen(),
      ),
      GoRoute(
        path: '/tvo',
        builder: (context, state) => const TvOScreen(),
      ),
      GoRoute(
        path: '/dealo',
        builder: (context, state) => const DealoMarketplaceScreen(),
      ),
      GoRoute(
        path: '/gemini',
        builder: (context, state) => const GeminiAiAssistantScreen(),
      ),
      GoRoute(
        path: '/promo',
        builder: (context, state) => const WhatsappStatusPromoScreen(),
      ),
      GoRoute(
        path: '/moneyo',
        builder: (context, state) => const WebModuleScreen(title: 'MoneyO - Agri Ledger & Finance', modulePath: 'moneyo'),
      ),
      GoRoute(
        path: '/tasko',
        builder: (context, state) => const WebModuleScreen(title: 'TaskO - Daily Tasks & Gig Work', modulePath: 'tasko'),
      ),
      GoRoute(
        path: '/toolso',
        builder: (context, state) => const WebModuleScreen(title: 'ToolsO - Calculators & Agri Tools', modulePath: 'toolso'),
      ),
      GoRoute(
        path: '/careers',
        builder: (context, state) => const WebModuleScreen(title: 'Careers & Opportunities', modulePath: 'careers'),
      ),
      GoRoute(
        path: '/admino',
        builder: (context, state) => const WebModuleScreen(title: 'AdminO - Super Admin Hub', modulePath: 'admino'),
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
        path: '/profile',
        builder: (context, state) => const ProfileDashboard(),
      ),
    ],
  );
});
