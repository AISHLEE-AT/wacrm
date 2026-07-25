import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

/// Clean External Web Module Launcher for AISHLEE-WEB Portal
class WebModuleScreen extends StatefulWidget {
  final String title;
  final String modulePath;

  const WebModuleScreen({
    super.key,
    required this.title,
    required this.modulePath,
  });

  /// Helper to launch AISHLEE-WEB modules directly in external browser
  static Future<void> launchInBrowser({
    required String path,
    BuildContext? context,
  }) async {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final user = Supabase.instance.client.auth.currentUser;
    final session = Supabase.instance.client.auth.currentSession;

    String authQueryParams = '?embed=true';
    String authHashFragment = '';
    if (user != null) {
      final String phone = user.phone ?? user.userMetadata?['phone']?.toString() ?? user.userMetadata?['whatsapp']?.toString() ?? '';
      final String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      authQueryParams += '&phone=$cleanPhone&user_id=${user.id}';
      if (session?.accessToken != null && session!.accessToken.isNotEmpty) {
        authHashFragment = '#access_token=${session.accessToken}';
        if (session.refreshToken != null && session.refreshToken!.isNotEmpty) {
          authHashFragment += '&refresh_token=${session.refreshToken}&token_type=bearer';
        }
      }
    }

    final Uri uri = Uri.parse('https://thamizhan.vercel.app$cleanPath$authQueryParams$authHashFragment');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Error launching web module $uri: $e');
    }
  }

  @override
  State<WebModuleScreen> createState() => _WebModuleScreenState();
}

class _WebModuleScreenState extends State<WebModuleScreen> {
  bool _launched = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerLaunch();
    });
  }

  Future<void> _triggerLaunch() async {
    if (_launched) return;
    setState(() => _launched = true);
    await WebModuleScreen.launchInBrowser(path: widget.modulePath);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.cyan.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.cyanAccent.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.language, color: Colors.cyanAccent, size: 64),
              ),
              const SizedBox(height: 20),
              Text(
                widget.title,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              const Text(
                'AISHLEE-WEB Separate Flow Portal',
                style: TextStyle(color: Colors.cyanAccent, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              const Text(
                'Opening web portal in your device browser for full performance...',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 28),
              ElevatedButton.icon(
                onPressed: _triggerLaunch,
                icon: const Icon(Icons.open_in_browser, color: Colors.black),
                label: const Text('Open in Browser', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00FF00),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
