import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:shared_preferences/shared_preferences.dart';

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
    final prefs = await SharedPreferences.getInstance();
    
    if (user != null) {
      // Check onboarding completion locally first (fast)
      final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;
      
      if (!onboardingComplete) {
        if (mounted) context.go('/onboarding/biometric');
        return;
      }
      
      // Check if verified driver → default to DriveO
      try {
        final driverData = await supabase.from('drivers')
            .select('is_verified').eq('user_id', user.id).maybeSingle();
        if (driverData != null && driverData['is_verified'] == true) {
          if (mounted) context.go('/driveo');
          return;
        }
      } catch (e) {}
      
      // Existing default module logic
      try {
        final data = await supabase.from('profiles').select('default_module')
            .eq('id', user.id).maybeSingle();
        if (data != null && data['default_module'] != null) {
          String route = data['default_module'] as String;
          if (route == '/rideo') route = '/ride';
          if (route == '/drivo') route = '/driveo';
          if (mounted) { context.go(route); return; }
        }
      } catch (e) {}
    }
    
    if (mounted) context.go('/home');
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
