import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'rider_map_screen.dart';
import 'driver_dashboard_screen.dart';

class CrmDashboardScreen extends StatefulWidget {
  const CrmDashboardScreen({super.key});

  @override
  State<CrmDashboardScreen> createState() => _CrmDashboardScreenState();
}

class _CrmDashboardScreenState extends State<CrmDashboardScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _currentTab = 0; // 0: Native RideO, 1: Native DriveO, 2: Web CRM

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

            // 3. Intercept RideO / DriveO routes & open native screens
            if (url.endsWith('/rideo')) {
              if (mounted) setState(() => _currentTab = 0);
              return NavigationDecision.prevent;
            }
            if (url.endsWith('/drivo')) {
              if (mounted) setState(() => _currentTab = 1);
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://watscrm.vercel.app/rideo'));

    // Grant Geolocation & Platform permissions for Android WebView
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
        // Fallback for wa.me if whatsapp:// intent isn't registered
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: IndexedStack(
          index: _currentTab,
          children: [
            // Tab 0: Native RideO Screen (GPS Map, Vehicle Selection, WhatsApp Connect)
            const RiderMapScreen(),

            // Tab 1: Native DriveO Screen (Live Driver Radar & Step-by-Step Navigation)
            const DriverDashboardScreen(),

            // Tab 2: WhatsApp Web CRM (Interception active for native WhatsApp & Google Maps)
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
            icon: Icon(Icons.chat),
            label: 'CRM Web',
          ),
        ],
      ),
    );
  }
}
