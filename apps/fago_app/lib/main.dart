import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'firebase_options.dart';
import 'router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase using platform-specific options (Fixes Android Crash)
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }

  // Initialize Supabase
  try {
    await Supabase.initialize(
      url: 'https://gmahjdzqitbomtmdzlfp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE',
    );
  } catch (e) {
    debugPrint("Supabase init error: $e");
  }

  runApp(
    const ProviderScope(
      child: FagoSuperApp(),
    ),
  );
}

class FagoSuperApp extends ConsumerWidget {
  const FagoSuperApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'FAGO - AishleeTech',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // Nature aesthetic from user logo
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00FF00), // Vibrant Green
          primary: const Color(0xFF00FF00),
          secondary: const Color(0xFFFFD700), // Golden Yellow
          brightness: Brightness.dark, // Deep black background
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0A0A), // Deep black with sparkles vibe
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      routerConfig: router,
    );
  }
}
