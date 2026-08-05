import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class RentoScreen extends StatelessWidget {
  const RentoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('RentO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildRentalCard('Mahindra 575 DI Tractor', 'Murugan Agri Rentals', '₹500 / Hour'),
          _buildRentalCard('Rotavator Machine', 'Uzhavan Tools', '₹300 / Hour'),
        ],
      ),
    );
  }

  Widget _buildRentalCard(String title, String owner, String rate) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.wrench, color: Color(0xFF84cc16)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('$owner • $rate', style: const TextStyle(color: Color(0xFF94a3b8))),
      ),
    );
  }
}
