import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MainLayout extends StatefulWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  String? _lastTrackedLocation;
  Timer? _globalPresenceTimer;

  @override
  void initState() {
    super.initState();
    _startGlobalPresenceHeartbeat();
  }

  @override
  void dispose() {
    _globalPresenceTimer?.cancel();
    super.dispose();
  }

  void _startGlobalPresenceHeartbeat() {
    _sendHeartbeat();
    _globalPresenceTimer = Timer.periodic(const Duration(seconds: 45), (_) => _sendHeartbeat());
  }

  Future<void> _sendHeartbeat() async {
    try {
      final supabase = Supabase.instance.client;
      final user = supabase.auth.currentUser;
      if (user == null) return;

      final nowIso = DateTime.now().toIso8601String();
      await supabase.from('profiles').update({'updated_at': nowIso}).eq('id', user.id);
    } catch (_) {}
  }

  void _trackLocation(String location) async {
    // Only track actual core modules
    const modules = ['/ride', '/admin', '/driveo', '/dealo', '/teacho', '/rento', '/agro', '/touro', '/testo', '/tvo', '/moneyo', '/gameo'];
    if (modules.contains(location)) {
      try {
        final supabase = Supabase.instance.client;
        final user = supabase.auth.currentUser;
        if (user != null) {
          await supabase.from('profiles').update({'default_module': location}).eq('id', user.id);
        }
      } catch (e) {
        // ignore errors silently
      }
    }
  }
  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/ai_hub')) return 2;
    if (location.startsWith('/dashboard')) return 3; // Profile
    
    // Everything else (admin, teacho, testo, etc.) falls into the "Module" tab
    return 1; 
  }

  void _onItemTapped(int index, BuildContext context) async {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        final location = GoRouterState.of(context).uri.path;
        if (location == '/home' || location == '/dashboard' || location == '/ai_hub') {
          final prefs = await SharedPreferences.getInstance();
          final selectedModule = prefs.getString('selected_module') ?? '/driveo';
          if (mounted) context.go(selectedModule);
        }
        break;
      case 2:
        context.go('/ai_hub');
        break;
      case 3:
        context.go('/dashboard');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final int currentIndex = _calculateSelectedIndex(context);
    final String location = GoRouterState.of(context).uri.path;
    
    // Track location changes
    if (location != _lastTrackedLocation) {
      _lastTrackedLocation = location;
      // Use microtask to avoid side effects during build phase
      Future.microtask(() => _trackLocation(location));
    }
    
    // Dynamic label for the Module tab
    String moduleLabel = 'Module';
    IconData moduleIcon = LucideIcons.zap;
    
    if (location.startsWith('/admin')) { moduleLabel = 'Admin'; moduleIcon = LucideIcons.shield; }
    else if (location.startsWith('/teacho')) { moduleLabel = 'TeachO'; moduleIcon = LucideIcons.graduationCap; }
    else if (location.startsWith('/testo')) { moduleLabel = 'TestO'; moduleIcon = LucideIcons.award; }
    else if (location.startsWith('/agro')) { moduleLabel = 'AgrO'; moduleIcon = LucideIcons.leaf; }
    else if (location.startsWith('/dealo')) { moduleLabel = 'DealO'; moduleIcon = LucideIcons.shoppingBag; }
    else if (location.startsWith('/driveo')) { moduleLabel = 'DriveO'; moduleIcon = LucideIcons.mapPin; }
    else if (location.startsWith('/touro')) { moduleLabel = 'TourO'; moduleIcon = LucideIcons.compass; }
    else if (location.startsWith('/moneyo')) { moduleLabel = 'MoneyO'; moduleIcon = LucideIcons.wallet; }
    else if (location.startsWith('/tvo')) { moduleLabel = 'TvO'; moduleIcon = LucideIcons.monitorPlay; }
    else if (location.startsWith('/ride')) { moduleLabel = 'RideO'; moduleIcon = LucideIcons.car; }
    else if (location.startsWith('/gameo')) { moduleLabel = 'GameO'; moduleIcon = LucideIcons.gamepad2; }
    else if (location.startsWith('/gaming_hub')) { moduleLabel = 'GameHub'; moduleIcon = LucideIcons.library; }
    else if (location.startsWith('/ai_hub')) { moduleLabel = 'AI Hub'; moduleIcon = LucideIcons.bot; }
    else if (location.startsWith('/rento')) { moduleLabel = 'RentO'; moduleIcon = LucideIcons.wrench; }

    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0d1526),
        selectedItemColor: const Color(0xFF10b981),
        unselectedItemColor: const Color(0xFF64748b),
        currentIndex: currentIndex,
        onTap: (index) => _onItemTapped(index, context),
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(LucideIcons.layoutGrid),
            label: 'Grid',
          ),
          BottomNavigationBarItem(
            icon: Icon(moduleIcon),
            label: moduleLabel,
          ),
          const BottomNavigationBarItem(
            icon: Icon(LucideIcons.bot),
            label: 'AI Bot',
          ),
          const BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
