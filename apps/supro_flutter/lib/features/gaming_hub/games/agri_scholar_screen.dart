import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../../services/offline_sync_service.dart';

class AgriScholarScreen extends StatefulWidget {
  const AgriScholarScreen({super.key});

  @override
  State<AgriScholarScreen> createState() => _AgriScholarScreenState();
}

class _AgriScholarScreenState extends State<AgriScholarScreen> {
  int _cropsHarvested = 0;
  int _totalPoints = 0;

  void _harvest() async {
    setState(() {
      _cropsHarvested++;
      _totalPoints += 100;
    });
    // Farmer game -> Farm Points pool
    await OfflineSyncService.addOfflineFarmPoints(100);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Crop Harvested! +100 Farm Points saved. Redeem for seed discounts!'),
          backgroundColor: Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF064E3B),
      appBar: AppBar(
        title: const Text('Agri-Scholar Simulator', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF065F46),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.sprout, size: 100, color: Colors.greenAccent),
            const SizedBox(height: 20),
            Text('Crops Harvested: $_cropsHarvested', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            Text('$_totalPoints Farm Points earned', style: const TextStyle(color: Colors.amber, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Earn 200 pts for 10% Farm Input Discount!', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _harvest,
              icon: const Icon(LucideIcons.wheat, color: Colors.white),
              label: const Text('Harvest Crop - Answer Trivia (+100 pts)', style: TextStyle(color: Colors.white, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
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