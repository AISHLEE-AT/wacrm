import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../services/offline_sync_service.dart';

class MythicQuestScreen extends StatefulWidget {
  const MythicQuestScreen({super.key});

  @override
  State<MythicQuestScreen> createState() => _MythicQuestScreenState();
}

class _MythicQuestScreenState extends State<MythicQuestScreen> {
  int _score = 0;

  void _completeLevel() async {
    setState(() => _score += 50);
    // Student game -> Testo Credits pool
    await OfflineSyncService.addOfflineTestoPoints(50);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Level Complete! +50 Testo Credits saved offline. Visit Rewards Wallet to redeem!'),
          backgroundColor: Color(0xFF8B5CF6),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1B4B),
      appBar: AppBar(
        title: const Text('Mythic Village Quest', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF312E81),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.sword, size: 100, color: Colors.amber),
            const SizedBox(height: 20),
            Text('Score: $_score pts (Testo Credits)', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Earn 100 pts to redeem a Free Mock Test!', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _completeLevel,
              icon: const Icon(LucideIcons.star, color: Colors.white),
              label: const Text('Simulate Level Completion (+50 pts)', style: TextStyle(color: Colors.white, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
