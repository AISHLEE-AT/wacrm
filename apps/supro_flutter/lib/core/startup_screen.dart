import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StartupScreen extends StatefulWidget {
  const StartupScreen({super.key});

  @override
  State<StartupScreen> createState() => _StartupScreenState();
}

class _StartupScreenState extends State<StartupScreen> {
  @override
  void initState() {
    super.initState();
    _checkDefaultModule();
  }

  Future<void> _checkDefaultModule() async {
    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    
    if (user != null) {
      try {
        // Find default_module by phone because Flutter app relies on phone-based authentication mapping in this ecosystem
        // Actually, user.id is fine if they are truly logged in with Supabase JWT. Let's try phone first just in case.
        // Wait, in auth_provider we used setSession. The user.id is valid. Let's use user.id to be safe and cross-platform.
        final data = await supabase.from('profiles').select('default_module').eq('id', user.id).maybeSingle();
        if (data != null && data['default_module'] != null) {
          final defaultModule = data['default_module'] as String;
          String route = defaultModule;
          if (route == '/rideo') route = '/ride';
          if (route == '/drivo') route = '/driveo';
          
          if (mounted) {
            context.go(route);
            return;
          }
        }
      } catch (e) {
        // Fallback on error
      }
    }
    
    // Fallback
    if (mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0a0f1e),
      body: Center(
        child: CircularProgressIndicator(color: Color(0xFF10b981)),
      ),
    );
  }
}
