import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'webview_screen.dart';
import 'rideo/rideo_dashboard.dart';
import '../auth/auth_provider.dart';

class SuperAppMainScreen extends ConsumerStatefulWidget {
  const SuperAppMainScreen({super.key});

  @override
  ConsumerState<SuperAppMainScreen> createState() => _SuperAppMainScreenState();
}

class _SuperAppMainScreenState extends ConsumerState<SuperAppMainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    // 0: Aishlee Dashboard (Web)
    const WebViewScreen(url: 'https://watscrm.vercel.app/home'),
    // 1: Aishlee Ecosystem Menu/Inbox (Web)
    const WebViewScreen(url: 'https://watscrm.vercel.app/inbox'),
    // 2: RideO (Native)
    const RideoDashboardScreen(),
    // 3: Wallet/Settings (Web)
    const WebViewScreen(url: 'https://watscrm.vercel.app/wallet'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.05),
              width: 1.0,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: const Color(0xFF0A0A0A),
          selectedItemColor: const Color(0xFF00FF00),
          unselectedItemColor: Colors.grey,
          showUnselectedLabels: true,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.apps_outlined),
              activeIcon: Icon(Icons.apps),
              label: 'Ecosystem',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.local_taxi_outlined),
              activeIcon: Icon(Icons.local_taxi),
              label: 'RideO',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Wallet',
            ),
          ],
        ),
      ),
    );
  }
}
