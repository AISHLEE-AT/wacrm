import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'admin_daily_news_tab.dart';
import 'admin_inbox_webview.dart';


class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFef4444).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.shieldCheck,
                  color: Color(0xFFef4444), size: 18),
            ),
            const SizedBox(width: 10),
            const Text('Admin CRM',
                style:
                    TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFF1E293B)),
        ),
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0d1526),
        selectedItemColor: const Color(0xFFef4444),
        unselectedItemColor: const Color(0xFF64748b),
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.inbox),
            label: 'Inbox',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.megaphone),
            label: 'Broadcasts',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.users),
            label: 'Contacts',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.settings),
            label: 'Settings',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.newspaper),
            label: 'Daily News',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildInbox();
      case 1:
        return const Center(
            child: Text('Broadcasts coming soon...',
                style: TextStyle(color: Colors.white)));
      case 2:
        return const Center(
            child: Text('Contacts Management',
                style: TextStyle(color: Colors.white)));
      case 3:
        return const Center(
            child: Text('Admin Settings',
                style: TextStyle(color: Colors.white)));
      case 4:
        return const AdminDailyNewsTab();
      default:
        return Container();
    }
  }

  Widget _buildInbox() {
    return const AdminInboxWebview();
  }
}
