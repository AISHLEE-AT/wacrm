import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../services/offline_sync_service.dart';

class JalTantraScreen extends StatefulWidget {
  const JalTantraScreen({super.key});

  @override
  State<JalTantraScreen> createState() => _JalTantraScreenState();
}

class _JalTantraScreenState extends State<JalTantraScreen> {
  int _puzzlesSolved = 0;
  int _totalPoints = 0;

  void _solvePuzzle() async {
    setState(() {
      _puzzlesSolved++;
      _totalPoints += 20;
    });
    // Farmer game -> Farm Points pool
    await OfflineSyncService.addOfflineFarmPoints(20);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Puzzle Solved! +20 Farm Points. Community goal closer!'),
          backgroundColor: Color(0xFF06B6D4),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF082F49),
      appBar: AppBar(
        title: const Text('Jal-Tantra (Water Puzzle)', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0C4A6E),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.droplets, size: 100, color: Colors.lightBlueAccent),
            const SizedBox(height: 20),
            Text('Puzzles Solved: $_puzzlesSolved', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            Text('$_totalPoints Farm Points earned', style: const TextStyle(color: Colors.amber, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Community earns free farm delivery at 10,000 puzzles!', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 13)),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _solvePuzzle,
              icon: const Icon(LucideIcons.waves, color: Colors.white),
              label: const Text('Solve Puzzle (+20 Farm pts)', style: TextStyle(color: Colors.white, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF06B6D4),
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