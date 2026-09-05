import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme.dart';
import 'core/router.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env");

  // 100% OCI Cloud — No Supabase initialization needed
  // Auth is handled via OCI JWT tokens stored in SharedPreferences
  // All data flows through https://mysupro.duckdns.org Express backend

  runApp(const ProviderScope(child: SuproApp()));
}

class SuproApp extends ConsumerWidget {
  const SuproApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goRouter = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'SuprO',
      theme: AppTheme.darkTheme,
      routerConfig: goRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
