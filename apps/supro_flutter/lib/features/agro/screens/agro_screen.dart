import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class AgroScreen extends StatelessWidget {
  const AgroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('AgrO & Mandi'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Today\'s Mandi Rates', style: TextStyle(color: Color(0xFF10b981), fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildMandiCard('Paddy (Ponni)', '₹2,150 / Quintal', '+₹40'),
          _buildMandiCard('Tomato (Local)', '₹28 / kg', '-₹3'),
        ],
      ),
    );
  }

  Widget _buildMandiCard(String crop, String price, String change) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.leaf, color: Color(0xFF10b981)),
        title: Text(crop, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(price, style: const TextStyle(color: Color(0xFF94a3b8))),
        trailing: Text(change, style: TextStyle(color: change.startsWith('+') ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
