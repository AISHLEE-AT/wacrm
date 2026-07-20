import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'webview_screen.dart';
import 'rideo/rideo_dashboard.dart';

final _kBaseUrl = 'https://watscrm.vercel.app';

// Bottom nav tabs definition — these are the persistent shell tabs
// The WebView shows WHICHEVER url the user navigated to last
final _navItems = [
  {'label': 'Home',      'icon': Icons.home_outlined,                   'activeIcon': Icons.home,                    'url': '$_kBaseUrl/'},
  {'label': 'Modules',   'icon': Icons.grid_view_outlined,              'activeIcon': Icons.grid_view,               'url': 'modules'}, // Shows module selector
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

  bool _showModuleSelector = false;

  @override
  void initState() {
    super.initState();

    if (widget.initialUrl != null && widget.initialUrl!.isNotEmpty) {
      final url = widget.initialUrl!;
      if (url == 'rideo') {
        _currentTab = 2;
      } else if (url == 'modules') {
        _showModuleSelector = true;
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
      _showModuleSelector = false;
    });
  }

  void _onNavTap(int index) {
    final url = _navItems[index]['url'] as String;

    if (url == 'rideo') {
      setState(() {
        _currentTab = 2;
        _showModuleSelector = false;
      });
    } else if (url == 'modules') {
      setState(() {
        _showModuleSelector = true;
        _currentTab = 1;
      });
    } else {
      // Navigate single WebView to the tapped tab's URL
      // _loadUrl sets _currentTab = 0, but for Home/Wallet we want the correct index
      setState(() {
        _urlHistory.add(_activeWebUrl);
        _activeWebUrl = url;
        _currentTab = index;
        _showModuleSelector = false;
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
          if (!_showModuleSelector && _currentTab != 2)
            Positioned.fill(
              child: WebViewScreen(
                key: const ValueKey('main_webview'),
                url: _activeWebUrl,
              ),
            ),

          // ── Native RideO screen ────────────────────────────────────────
          if (_currentTab == 2)
            const Positioned.fill(child: RideODashboard()),

          // ── Module Selector overlay ────────────────────────────────────
          if (_showModuleSelector)
            Positioned.fill(
              child: _ModuleSelectorPanel(
                onModuleSelected: (url) {
                  if (url == 'rideo') {
                    setState(() {
                      _currentTab = 2;
                      _showModuleSelector = false;
                    });
                  } else {
                    _loadUrl(url);
                  }
                },
                onClose: () => setState(() => _showModuleSelector = false),
              ),
            ),
        ],
      ),
      bottomNavigationBar: _BottomBar(
        currentIndex: _currentTab,
        onTap: _onNavTap,
        navItems: _navItems,
        activeWebUrl: _activeWebUrl,
      ),
    );
  }
}

// ─── Compact Module Selector shown as bottom sheet / overlay ─────────────────
final _kBaseUrlInner = 'https://watscrm.vercel.app';
final _allModules = [
  {'title': 'TeachO',  'icon': Icons.school_rounded,             'color': Color(0xFF3B82F6), 'url': '$_kBaseUrlInner/teacho'},
  {'title': 'TestO',   'icon': Icons.fact_check_rounded,         'color': Color(0xFFEF4444), 'url': '$_kBaseUrlInner/testo'},
  {'title': 'TourO',   'icon': Icons.flight_rounded,             'color': Color(0xFF10B981), 'url': '$_kBaseUrlInner/touro'},
  {'title': 'MoneyO',  'icon': Icons.account_balance_wallet_rounded, 'color': Color(0xFFF59E0B), 'url': '$_kBaseUrlInner/moneyo'},
  {'title': 'TaskO',   'icon': Icons.task_alt_rounded,           'color': Color(0xFF8B5CF6), 'url': '$_kBaseUrlInner/tasko'},
  {'title': 'TradeO',  'icon': Icons.storefront_rounded,         'color': Color(0xFFEC4899), 'url': '$_kBaseUrlInner/tradeo'},
  {'title': 'TvO',     'icon': Icons.tv_rounded,                 'color': Color(0xFF14B8A6), 'url': '$_kBaseUrlInner/tvo'},
  {'title': 'RideO',   'icon': Icons.directions_car_rounded,     'color': Color(0xFF6366F1), 'url': 'rideo'},
  {'title': 'Profile', 'icon': Icons.person_rounded,             'color': Color(0xFF64748B), 'url': '$_kBaseUrlInner/profile'},
];

class _ModuleSelectorPanel extends StatelessWidget {
  final void Function(String url) onModuleSelected;
  final VoidCallback onClose;

  const _ModuleSelectorPanel({
    required this.onModuleSelected,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SELECT MODULE',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white38,
                          letterSpacing: 2.5,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Only chosen page loads',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: onClose,
                    icon: const Icon(Icons.close, color: Colors.white54),
                  ),
                ],
              ),
            ),

            // Grid
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.95,
                  ),
                  itemCount: _allModules.length,
                  itemBuilder: (context, i) {
                    final mod = _allModules[i];
                    final color = mod['color'] as Color;
                    final icon = mod['icon'] as IconData;
                    return GestureDetector(
                      onTap: () => onModuleSelected(mod['url'] as String),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: color.withOpacity(0.1),
                          border: Border.all(color: color.withOpacity(0.3), width: 1.5),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(icon, color: color, size: 24),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              mod['title'] as String,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

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
