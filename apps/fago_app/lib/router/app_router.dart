import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/superapp_main_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/superapp',
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
        path: '/superapp',
        builder: (context, state) {
          final url = state.uri.queryParameters['url'];
          final tab = state.uri.queryParameters['tab'];
          return SuperAppMainScreen(
            initialUrl: url != null ? Uri.decodeComponent(url) : null,
            initialIndex: tab != null ? int.tryParse(tab) ?? 0 : 0,
          );
        },
      ),
    ],
  );
});
