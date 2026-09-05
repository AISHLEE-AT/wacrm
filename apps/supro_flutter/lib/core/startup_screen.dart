import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'env.dart';

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
    final prefs = await SharedPreferences.getInstance();
    final phone = prefs.getString('user_phone');
    final token = prefs.getString('oci_auth_token');

    if (phone == null || token == null) {
      if (mounted) context.go('/login');
      return;
    }

    // Check onboarding completion locally first (fast)
    final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;

    if (!onboardingComplete) {
      if (mounted) context.go('/onboarding/biometric');
      return;
    }

    // Fetch profile + driver status from OCI
    try {
      final response = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/auth/check?phone=$phone'),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Check if verified driver → default to DriveO
        final role = data['role'] ?? '';
        if (role == 'driver' || data['category'] == 'Driver') {
          if (mounted) { context.go('/driveo'); return; }
        }

        // Admin → admin screen
        if (role == 'admin' || data['category'] == 'Admin') {
          if (mounted) { context.go('/admin'); return; }
        }

        // Check default module from profile
        final defaultModule = data['default_module'];
        if (defaultModule != null && defaultModule.toString().isNotEmpty) {
          String route = defaultModule.toString();
          if (route == '/rideo') route = '/ride';
          if (route == '/drivo') route = '/driveo';
          if (mounted) { context.go(route); return; }
        }

        // Route by category
        final category = (data['category'] ?? 'Traveller').toString().toLowerCase();
        if (category.contains('student') || category.contains('learner')) {
          if (mounted) { context.go('/teacho'); return; }
        } else if (category.contains('farmer') || category.contains('agri')) {
          if (mounted) { context.go('/agro'); return; }
        } else if (category.contains('driver')) {
          if (mounted) { context.go('/driveo'); return; }
        } else if (category.contains('shopper') || category.contains('merchant')) {
          if (mounted) { context.go('/dealo'); return; }
        }
      }
    } catch (e) {
      // Network error — fall through to home
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
