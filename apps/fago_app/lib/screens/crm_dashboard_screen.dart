import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import 'rider_map_screen.dart';
import 'driver_dashboard_screen.dart';
import 'rento_screen.dart';

class CrmDashboardScreen extends ConsumerStatefulWidget {
  const CrmDashboardScreen({super.key});

  @override
  ConsumerState<CrmDashboardScreen> createState() => _CrmDashboardScreenState();
}

class _CrmDashboardScreenState extends ConsumerState<CrmDashboardScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _currentTab = 0; // 0: Native RideO, 1: Native DriveO, 2: Native RentO, 3: CRM Web

  @override
  void initState() {
    super.initState();
    _requestLocationPermission();
    _initWebViewController();
  }

  void _initWebViewController() {
    final WebViewController controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;

            // 1. Intercept WhatsApp Deep-Links & Launch Native Mobile App
            if (url.startsWith('whatsapp://') ||
                url.contains('wa.me') ||
                url.contains('api.whatsapp.com')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            // 2. Intercept Google Maps Navigation Intents & Launch Installed App ($0 Cost)
            if (url.startsWith('google.navigation:') ||
                url.contains('google.com/maps')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            // 3. Intercept RideO / DriveO / RentO routes & open native screens
            if (url.endsWith('/rideo')) {
              if (mounted) setState(() => _currentTab = 0);
              return NavigationDecision.prevent;
            }
            if (url.endsWith('/drivo')) {
              if (mounted) setState(() => _currentTab = 1);
              return NavigationDecision.prevent;
            }
            if (url.endsWith('/rento')) {
              if (mounted) setState(() => _currentTab = 2);
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

    _controller = controller;
  }

  Future<void> _launchExternalUri(Uri uri) async {
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (uri.toString().contains('whatsapp://')) {
          final cleanPhone = uri.queryParameters['phone'] ?? '';
          final text = uri.queryParameters['text'] ?? '';
          final webFallback = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(text)}');
          await launchUrl(webFallback, mode: LaunchMode.externalApplication);
        }
      }
    } catch (e) {
      debugPrint('Error launching external URI: $e');
    }
  }

  Future<void> _requestLocationPermission() async {
    try {
      await [
        Permission.location,
        Permission.locationWhenInUse,
        Permission.camera,
        Permission.notification,
        Permission.microphone,
      ].request();
    } catch (e) {
      debugPrint('Permission request error: $e');
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

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final formattedPhone = _formatDisplayPhone(authState);
    final isAdmin = authState.role == UserRole.admin;
    final isDriver = authState.role == UserRole.driver || isAdmin;
    final isLoggedIn = authState.role != UserRole.guest;

    return Scaffold(
      backgroundColor: Colors.black,
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: Column(
          children: [
            // Drawer Header with FAGO Logo & User Info
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF065F46)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Text(
                  isAdmin ? '🛡️' : (isDriver ? '🚛' : '🛵'),
                  style: const TextStyle(fontSize: 28),
                ),
              ),
              accountName: Text(
                isAdmin ? 'ADMINISTRATOR' : (isDriver ? 'DRIVER PARTNER' : 'RIDER USER'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
              ),
              accountEmail: Row(
                children: [
                  Text(formattedPhone, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isAdmin ? Colors.amber : (isDriver ? Colors.orange : Colors.blue),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      authState.role.name.toUpperCase(),
                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),

            // Mode Toggle Switch (Rider <-> Driver)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                          setState(() => _currentTab = 0);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _currentTab == 0 ? const Color(0xFF10B981) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.directions_car, size: 16, color: Colors.white),
                              SizedBox(width: 4),
                              Text('Rider View', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                          setState(() => _currentTab = 1);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _currentTab == 1 ? const Color(0xFFF97316) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.local_shipping, size: 16, color: Colors.white),
                              SizedBox(width: 4),
                              Text('Driver View', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Divider(color: Colors.white12),

            // Navigation Items
            ListTile(
              leading: const Icon(Icons.directions_car, color: Color(0xFF10B981)),
              title: const Text('RideO - Book Ride', style: TextStyle(color: Colors.white)),
              selected: _currentTab == 0,
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 0);
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_shipping, color: Color(0xFFF97316)),
              title: const Text('DriveO - Driver Radar', style: TextStyle(color: Colors.white)),
              selected: _currentTab == 1,
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 1);
              },
            ),
            ListTile(
              leading: const Icon(Icons.agriculture, color: Color(0xFF22C55E)),
              title: const Text('RentO - Agri Machinery', style: TextStyle(color: Colors.white)),
              selected: _currentTab == 2,
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 2);
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat_bubble, color: Color(0xFF3B82F6)),
              title: const Text('CRM Web & WhatsApp', style: TextStyle(color: Colors.white)),
              selected: _currentTab == 3,
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentTab = 3);
              },
            ),

            // ADMIN CONTROLS SECTION (Visible ONLY if Admin)
            if (isAdmin) ...[
              const Divider(color: Colors.amber),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Text('ADMINISTRATION CONTROLS', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
              ListTile(
                leading: const Icon(Icons.shield, color: Colors.amber),
                title: const Text('Admin Overview', style: TextStyle(color: Colors.amber)),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/admin');
                },
              ),
              ListTile(
                leading: const Icon(Icons.people, color: Colors.amber),
                title: const Text('Manage Drivers & Applications', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  _controller.loadRequest(Uri.parse('https://watscrm.vercel.app/admin/drivers'));
                  setState(() => _currentTab = 3);
                },
              ),
            ],

            const Spacer(),

            // LOGIN VIA WHATSAPP BUTTON (Prominent Button at Drawer Bottom)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    context.push('/login');
                  },
                  icon: const Icon(Icons.chat_bubble_outline, color: Colors.white),
                  label: Text(
                    isLoggedIn ? 'SWITCH ACCOUNT VIA WHATSAPP' : 'LOGIN VIA WHATSAPP',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),

            // Profile & Digital ID Link
            ListTile(
              leading: const Icon(Icons.badge, color: Colors.cyanAccent),
              title: const Text('Digital ID & Profile', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                context.push('/profile');
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
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
            // Tab 0: Native RideO Screen
            const RiderMapScreen(),

            // Tab 1: Native DriveO Screen
            const DriverDashboardScreen(),

            // Tab 2: Native RentO Machinery Rental Screen
            const RentOScreen(),

            // Tab 3: WhatsApp Web CRM
            Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_isLoading)
                  const Center(
                    child: CircularProgressIndicator(color: Color(0xFF10B981)),
                  ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (index) => setState(() => _currentTab = index),
        backgroundColor: Colors.black,
        selectedItemColor: const Color(0xFF10B981),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.directions_car),
            label: 'RideO Native',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.local_shipping),
            label: 'DriveO Native',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.agriculture),
            label: 'RentO Native',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'CRM Web',
          ),
        ],
      ),
    );
  }
}
