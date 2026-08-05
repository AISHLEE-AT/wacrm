import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../services/offline_sync_service.dart';

class VocabBuilderScreen extends StatefulWidget {
  const VocabBuilderScreen({super.key});

  @override
  State<VocabBuilderScreen> createState() => _VocabBuilderScreenState();
}

class _VocabBuilderScreenState extends State<VocabBuilderScreen> {
  int _wordsFound = 0;
  int _totalPoints = 0;

  void _findWord() async {
    setState(() {
      _wordsFound++;
      _totalPoints += 10;
    });
    // Student game -> Testo Credits pool
    await OfflineSyncService.addOfflineTestoPoints(10);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Word Found! +10 Testo Credits saved offline.'),
          backgroundColor: Color(0xFF3B82F6),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Vocab-Builder', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1E293B),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.bookA, size: 100, color: Colors.blue),
            const SizedBox(height: 20),
            Text('Words Found: $_wordsFound', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            Text('$_totalPoints Testo Credits earned', style: const TextStyle(color: Colors.amber, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Earn 100 pts to redeem a Free Mock Test!', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _findWord,
              icon: const Icon(LucideIcons.zap, color: Colors.white),
              label: const Text('Find a Word (+10 pts)', style: TextStyle(color: Colors.white, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
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