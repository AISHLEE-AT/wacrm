import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'webview_screen.dart';
import 'rideo/rideo_dashboard.dart';

final _kBaseUrl = 'https://watscrm.vercel.app';

// Bottom nav tabs definition — these are the persistent shell tabs
// The WebView shows WHICHEVER url the user navigated to last
final _navItems = [
  {'label': 'Home',      'icon': Icons.home_outlined,                   'activeIcon': Icons.home,                    'url': '$_kBaseUrl/'},
  {'label': 'Admin',     'icon': Icons.admin_panel_settings_outlined,   'activeIcon': Icons.admin_panel_settings,    'url': '$_kBaseUrl/admino'}, 
  {'label': 'RideO',     'icon': Icons.local_taxi_outlined,             'activeIcon': Icons.local_taxi,              'url': 'rideo'}, // Native
  {'label': 'Wallet',    'icon': Icons.account_balance_wallet_outlined, 'activeIcon': Icons.account_balance_wallet,  'url': '$_kBaseUrl/wallet'},
];

class SuperAppMainScreen extends ConsumerStatefulWidget {
  /// The initial URL to load. Passed from ModuleSelectionScreen.
  /// If null, defaults to /home.
  final String? initialUrl;

  // Legacy int-based initialIndex support
  final int initialIndex;

  const SuperAppMainScreen({
    super.key,
    this.initialUrl,
    this.initialIndex = 0,
  });

  @override
  ConsumerState<SuperAppMainScreen> createState() => _SuperAppMainScreenState();
}

class _SuperAppMainScreenState extends ConsumerState<SuperAppMainScreen> {
  int _currentTab = 0;

  /// The URL currently loaded in the single WebView
  String _activeWebUrl = '$_kBaseUrl/';

  /// History stack so back button works correctly
  final List<String> _urlHistory = [];



  @override
  void initState() {
    super.initState();

    if (widget.initialUrl != null && widget.initialUrl!.isNotEmpty) {
      final url = widget.initialUrl!;
      if (url == 'rideo') {
        _currentTab = 2;
      } else {
        _activeWebUrl = url;
        _currentTab = 0; // WebView tab
      }
    } else {
      // Legacy tab-based init
      _currentTab = widget.initialIndex;
      final navUrl = _navItems[_currentTab.clamp(0, _navItems.length - 1)]['url'] as String;
      if (navUrl != 'rideo' && navUrl != 'modules') {
        _activeWebUrl = navUrl;
      }
    }
  }

  /// Navigate the single WebView to a new URL (zero extra egress - same session)
  void _loadUrl(String url) {
    setState(() {
      _urlHistory.add(_activeWebUrl);
      _activeWebUrl = url;
      _currentTab = 0; // Switch to WebView tab
    });
  }

  void _onNavTap(int index) {
    final url = _navItems[index]['url'] as String;

    if (url == 'rideo') {
      setState(() {
        _currentTab = 2;
      });
    } else {
      // Navigate single WebView to the tapped tab's URL
      // _loadUrl sets _currentTab = 0, but for Home/Wallet we want the correct index
      setState(() {
        _urlHistory.add(_activeWebUrl);
        _activeWebUrl = url;
        _currentTab = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // ── Single WebView (always alive, just changes URL) ────────────
          if (_currentTab != 2)
            Positioned.fill(
              child: WebViewScreen(
                key: const ValueKey('main_webview'),
                url: _activeWebUrl,
              ),
            ),

          // ── Native RideO screen ────────────────────────────────────────
          if (_currentTab == 2)
            const Positioned.fill(child: RideODashboard()),



// ─── Bottom Navigation Bar ────────────────────────────────────────────────────
class _BottomBar extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;
  final List<Map<String, dynamic>> navItems;
  final String activeWebUrl;

  const _BottomBar({
    required this.currentIndex,
    required this.onTap,
    required this.navItems,
    required this.activeWebUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.07), width: 1),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex.clamp(0, navItems.length - 1),
        onTap: onTap,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: Colors.grey.shade600,
        showUnselectedLabels: true,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: navItems.map((tab) => BottomNavigationBarItem(
          icon: Icon(tab['icon'] as IconData),
          activeIcon: Icon(tab['activeIcon'] as IconData),
          label: tab['label'] as String,
        )).toList(),
      ),
    );
  }
}
