import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import 'rider_map_screen.dart';
import 'driver_dashboard_screen.dart';
import 'rento_screen.dart';
import '../features/dealo/screens/dealo_marketplace_screen.dart';
import '../features/profile/screens/profile_dashboard.dart';
import '../services/whatsapp_service.dart';
import '../features/promo/screens/whatsapp_status_promo_screen.dart';
import 'web_module_screen.dart';

class CrmDashboardScreen extends ConsumerStatefulWidget {
  const CrmDashboardScreen({super.key});

  @override
  ConsumerState<CrmDashboardScreen> createState() => _CrmDashboardScreenState();
}

class _CrmDashboardScreenState extends ConsumerState<CrmDashboardScreen> {
  int _currentTab = 0; // 0: Transport (RideO/DriveO), 1: DealO, 2: RentO, 3: Profile
  bool _isDriverMode = false; // User-selected Rider vs Driver mode toggle

  @override
  void initState() {
    super.initState();
    _requestLocationPermission();
  }

  Future<void> _requestLocationPermission() async {
    await Permission.location.request();
  }

  String _formatDisplayPhone(AuthState authState) {
    final fbUser = authState.firebaseUser;
    final sbUser = authState.supabaseUser;

    String raw = fbUser?.phoneNumber ?? sbUser?.phone ?? sbUser?.userMetadata?['phone']?.toString() ?? sbUser?.email ?? '';
    if (raw.contains('@')) {
      raw = raw.split('@')[0];
    }
    raw = raw.replaceAll(RegExp(r'\D'), '');
    if (raw.startsWith('91') && raw.length == 12) {
      raw = raw.substring(2);
    }
    if (raw.length == 10) {
      return '+91 ${raw.substring(0, 5)} ${raw.substring(5)}';
    }
    return raw.isNotEmpty ? '+91 $raw' : 'Registered WhatsApp User';
  }

  // 10 Super App Categories Grid Selector Modal
  void _openCategoryGridModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final categories = [
          {'name': '🌐 AISHLEE-WEB Portal', 'desc': 'Open Web Flow in Browser', 'route': '/', 'tab': -2},
          {'name': '🏷️ DealO (Marketplace)', 'desc': '5km Radius P2P Deals', 'route': '/dealo', 'tab': 1},
          {'name': '🚖 RideO (Book Ride)', 'desc': 'On-Demand Rides', 'route': '/rideo', 'tab': 0},
          {'name': '🚚 DriveO (Driver Radar)', 'desc': 'Driver Acceptance', 'route': '/drivo', 'tab': 0},
          {'name': '🚜 RentO (Agri Rental)', 'desc': 'Machinery Rentals', 'route': '/rento', 'tab': 2},
          {'name': '🎓 TeachO (Academy)', 'desc': 'Skill Guides & Courses', 'route': '/teacho', 'tab': -1},
          {'name': '📝 TestO (Exam Hub)', 'desc': 'Mock Tests & Certification', 'route': '/testo', 'tab': -1},
          {'name': '📺 TvO (Video Guides)', 'desc': 'Agri & Driver Streaming', 'route': '/tvo', 'tab': -1},
          {'name': '💰 MoneyO (Finance)', 'desc': 'Agri Ledger & Savings', 'route': '/moneyo', 'tab': -2},
          {'name': '📋 TaskO (Gig Work)', 'desc': 'Daily Tasks & Opportunities', 'route': '/tasko', 'tab': -2},
          {'name': '🤖 AI & ToolsO (AI + கருவிகள்)', 'desc': 'Gemini AI + ToolsO Suite', 'route': '/toolso', 'tab': -2},
          {'name': '🌾 AgrO (சந்தை & விதைகள்)', 'desc': 'Crop Rates & Agri Tools', 'route': '/mandi', 'tab': -1},
          {'name': '🛕 TourO (ஆன்மீகம்)', 'desc': 'Spiritual Temple Tours', 'route': '/touro', 'tab': -1},
          {'name': '👤 Profile & ID', 'desc': 'KYC & Digital Pass', 'route': '/profile', 'tab': 3},
        ];

        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '⚡ FAGO Super App (அனைத்து சேவைகள்)',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // 1-Tap Category Dropdown Selector for Mobile Screens
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF222222),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.5)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    hint: const Text("⚡ Select Category / Module Dropdown", style: TextStyle(color: Color(0xFFFFD700), fontSize: 13, fontWeight: FontWeight.bold)),
                    isExpanded: true,
                    dropdownColor: const Color(0xFF1E1E1E),
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    items: categories.map((cat) {
                      return DropdownMenuItem<String>(
                        value: cat['name'].toString(),
                        child: Text("${cat['name']} - ${cat['desc']}", overflow: TextOverflow.ellipsis),
                      );
                    }).toList(),
                    onChanged: (selectedName) {
                      if (selectedName == null) return;
                      final cat = categories.firstWhere((c) => c['name'] == selectedName);
                      Navigator.pop(ctx);
                      final int tab = cat['tab'] as int;
                      if (tab >= 0) {
                        setState(() {
                          _currentTab = tab;
                          if (cat['name'].toString().contains('DriveO')) {
                            _isDriverMode = true;
                          } else if (cat['name'].toString().contains('RideO')) {
                            _isDriverMode = false;
                          }
                        });
                      } else if (tab == -2) {
                        WebModuleScreen.launchInBrowser(path: cat['route'] as String);
                      } else {
                        context.push(cat['route'] as String);
                      }
                    },
                  ),
                ),
              ),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 2.2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  return InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      final int tab = cat['tab'] as int;
                      if (tab >= 0) {
                        setState(() {
                          _currentTab = tab;
                          if (cat['name'].toString().contains('DriveO')) {
                            _isDriverMode = true;
                          } else if (cat['name'].toString().contains('RideO')) {
                            _isDriverMode = false;
                          }
                        });
                      } else if (tab == -2) {
                        WebModuleScreen.launchInBrowser(path: cat['route'] as String);
                      } else {
                        context.push(cat['route'] as String);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF222222),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(cat['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                          const SizedBox(height: 2),
                          Text(cat['desc'] as String, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    if (authState.role == UserRole.guest || (authState.firebaseUser == null && authState.supabaseUser == null)) {
      return const LoginScreen();
    }

    final formattedPhone = _formatDisplayPhone(authState);
    final isAdmin = authState.role == UserRole.admin;
    final isDriverRole = authState.role == UserRole.driver || isAdmin;
    final showDriverView = _isDriverMode || isDriverRole;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141414),
        foregroundColor: Colors.white,
        title: Text(
          showDriverView ? '🚚 DriveO (Driver Mode)' : '🚖 RideO (Rider Mode)',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          // 🔄 Rider <-> Driver Mode Toggle Button in AppBar
          TextButton.icon(
            onPressed: () {
              setState(() => _isDriverMode = !_isDriverMode);
            },
            icon: Icon(showDriverView ? Icons.directions_car : Icons.local_shipping, size: 16, color: const Color(0xFF00FF00)),
            label: Text(
              showDriverView ? 'Rider Mode' : 'Driver Mode',
              style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 11),
            ),
          ),
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const WhatsappStatusPromoScreen()),
              );
            },
            icon: const Icon(Icons.amp_stories, color: Color(0xFF25D366)),
            tooltip: 'Share Tamil Promo to WhatsApp Status',
          ),
          IconButton(
            onPressed: _openCategoryGridModal,
            icon: const Icon(Icons.grid_view_rounded, color: Colors.white),
            tooltip: 'All Services Grid',
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ⚡ Instant Area Admin WhatsApp Auto-Link Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              color: const Color(0xFF1E293B),
              child: Row(
                children: [
                  const Icon(Icons.groups, color: Color(0xFF00FF00), size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      '💬 Registered via QR? Auto-link cell to Area Admin WhatsApp Group!',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      final phone = formattedPhone.replaceAll(RegExp(r'\D'), '');
                      WhatsAppService.openWhatsApp(
                        phone: '919486335870',
                        message: "👋 Hello Area Admin! I registered on FAGO App via QR code (Cell: +91 $phone). Please add me to the local Pincode WhatsApp Group & send my welcome guide!",
                      );
                    },
                    icon: const Icon(Icons.double_arrow, size: 14, color: Color(0xFF00FF00)),
                    label: const Text('Link Group', style: TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: IndexedStack(
                index: _currentTab,
                children: [
                  // Tab 0: Role-based Transport Screen (RiderMapScreen for Rider vs DriverDashboardScreen for Driver)
                  showDriverView ? const DriverDashboardScreen() : const RiderMapScreen(),

                  // Tab 1: DealO P2P Marketplace Screen
                  const DealoMarketplaceScreen(),

                  // Tab 2: RentO Machinery Rental Screen
                  const RentOScreen(),

                  // Tab 3: Profile & Digital ID Screen
                  const ProfileDashboard(),
                ],
              ),
            ),
          ],
        ),
      ),
      // Clean Role-Based Bottom Navigation Bar (No duplicate DriveO/RideO tabs!)
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF141414),
          border: Border(top: BorderSide(color: Colors.white12, width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentTab,
          onTap: (index) {
            if (index == 4) {
              _openCategoryGridModal();
            } else {
              setState(() => _currentTab = index);
            }
          },
          backgroundColor: const Color(0xFF141414),
          selectedItemColor: const Color(0xFF00FF00),
          unselectedItemColor: Colors.grey.shade500,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          items: [
            BottomNavigationBarItem(
              icon: Icon(showDriverView ? Icons.local_shipping_rounded : Icons.directions_car_filled_rounded),
              activeIcon: Icon(showDriverView ? Icons.local_shipping_rounded : Icons.directions_car_filled_rounded, color: const Color(0xFF00FF00)),
              label: showDriverView ? 'DriveO (Driver)' : 'RideO (Rider)',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_rounded),
              activeIcon: Icon(Icons.shopping_bag_rounded, color: Color(0xFF00FF00)),
              label: 'DealO',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.agriculture_rounded),
              activeIcon: Icon(Icons.agriculture_rounded, color: Colors.amber),
              label: 'RentO',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded),
              activeIcon: Icon(Icons.person_rounded, color: Colors.cyanAccent),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
