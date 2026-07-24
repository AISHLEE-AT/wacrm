import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../auth/login_screen.dart';
import 'rider_map_screen.dart';
import 'driver_dashboard_screen.dart';
import 'rento_screen.dart';
import '../features/dealo/screens/dealo_marketplace_screen.dart';
import '../features/profile/screens/profile_dashboard.dart';

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
    _initWebViewController();
  }

  Future<void> _requestLocationPermission() async {
    await Permission.location.request();
  }

  void _initWebViewController() {
    final WebViewController controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;

            if (url.startsWith('whatsapp://') ||
                url.contains('wa.me') ||
                url.contains('api.whatsapp.com')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            if (url.startsWith('google.navigation:') || url.contains('google.com/maps')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://watscrm.vercel.app/rideo'));

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setOnPlatformPermissionRequest(
        (PlatformWebViewPermissionRequest request) {
          request.grant();
        },
      );
    }
  }

  Future<void> _launchExternalUri(Uri uri) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _formatDisplayPhone(AuthState authState) {
    final fbUser = authState.firebaseUser;
    final sbUser = authState.supabaseUser;

    String raw = fbUser?.phoneNumber ?? sbUser?.phone ?? sbUser?.email ?? '9486335870';
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
    return raw.isNotEmpty ? raw : '+91 94863 35870';
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
          {'name': '🏷️ DealO (Marketplace)', 'desc': '5km Radius P2P Deals', 'route': '/dealo', 'tab': 1},
          {'name': '🚖 RideO (Book Ride)', 'desc': 'On-Demand Rides', 'route': '/rideo', 'tab': 0},
          {'name': '🚚 DriveO (Driver Radar)', 'desc': 'Driver Acceptance', 'route': '/drivo', 'tab': 0},
          {'name': '🚜 RentO (Agri Rental)', 'desc': 'Machinery Rentals', 'route': '/rento', 'tab': 2},
          {'name': '🎓 TeachO (Academy)', 'desc': 'Skill Guides & Courses', 'route': '/teacho', 'tab': -1},
          {'name': '📝 TestO (Exam Hub)', 'desc': 'Mock Tests & Certification', 'route': '/testo', 'tab': -1},
          {'name': '📺 TvO (Video Guides)', 'desc': 'Agri & Driver Streaming', 'route': '/tvo', 'tab': -1},
          {'name': '💰 MoneyO (Finance)', 'desc': 'Agri Ledger & Savings', 'route': '/moneyo', 'tab': -1},
          {'name': '📋 TaskO (Gig Work)', 'desc': 'Daily Tasks & Opportunities', 'route': '/tasko', 'tab': -1},
          {'name': '🛠️ ToolsO (Suite)', 'desc': 'Calculators & Agri Tools', 'route': '/toolso', 'tab': -1},
          {'name': '🥬 Mandi (சந்தை)', 'desc': 'Wholesale Crop Rates', 'route': '/mandi', 'tab': -1},
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
              const SizedBox(height: 16),
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
            onPressed: _openCategoryGridModal,
            icon: const Icon(Icons.grid_view_rounded, color: Colors.white),
            tooltip: 'All Services Grid',
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF00FF00), Color(0xFF008000)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.black,
                child: Text('F', style: TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 24)),
              ),
              accountName: Text(
                showDriverView ? 'Verified Driver' : 'FAGO User',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
              ),
              accountEmail: Text(formattedPhone, style: const TextStyle(color: Colors.black87)),
            ),

            ListTile(
              leading: Icon(showDriverView ? Icons.directions_car : Icons.local_shipping, color: const Color(0xFF00FF00)),
              title: Text(showDriverView ? 'Switch to Rider Mode' : 'Switch to Driver Mode', style: const TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _isDriverMode = !_isDriverMode);
              },
            ),
            const Divider(color: Colors.white12),

            ListTile(
              leading: const Icon(Icons.shopping_bag, color: Color(0xFF00FF00)),
              title: const Text('DealO (Marketplace 5km)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 1);
              },
            ),
            ListTile(
              leading: const Icon(Icons.agriculture, color: Colors.amber),
              title: const Text('RentO (Agri Rental)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 2);
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_basket, color: Color(0xFF00FF00)),
              title: const Text('உழவர் சந்தை (Mandi Prices)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/mandi');
              },
            ),
            ListTile(
              leading: const Icon(Icons.school, color: Colors.purpleAccent),
              title: const Text('TeachO (Skill Academy)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/teacho');
              },
            ),
            ListTile(
              leading: const Icon(Icons.assignment, color: Colors.cyanAccent),
              title: const Text('TestO (Mock Exam Hub)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/testo');
              },
            ),
            ListTile(
              leading: const Icon(Icons.temple_hindu, color: Colors.orangeAccent),
              title: const Text('TourO (ஆன்மீக சுற்றுலா)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/touro');
              },
            ),
            ListTile(
              leading: const Icon(Icons.play_circle_fill, color: Colors.redAccent),
              title: const Text('TvO (Media & Video Guides)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/tvo');
              },
            ),
            ListTile(
              leading: const Icon(Icons.account_balance, color: Color(0xFF10B981)),
              title: const Text('MoneyO (Agri Ledger & Finance)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/moneyo');
              },
            ),
            ListTile(
              leading: const Icon(Icons.check_box, color: Colors.blueAccent),
              title: const Text('TaskO (Gig Tasks & Work)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/tasko');
              },
            ),
            ListTile(
              leading: const Icon(Icons.build_circle, color: Colors.amberAccent),
              title: const Text('ToolsO (Calculators & Tools)', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/toolso');
              },
            ),

            const Spacer(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                ref.read(authProvider.notifier).signOut();
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      body: SafeArea(
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
