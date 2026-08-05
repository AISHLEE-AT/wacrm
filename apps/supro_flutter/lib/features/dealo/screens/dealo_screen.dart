import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class DealoScreen extends StatelessWidget {
  const DealoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('DealO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildDealCard('50% OFF Organic Vegetables', 'Uzhavar Santhai', 'Grocery'),
          _buildDealCard('Buy 1 Get 1 Free Pizza', 'Domino\'s', 'Food'),
        ],
      ),
    );
  }

  Widget _buildDealCard(String title, String store, String category) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.tag, color: Color(0xFFf97316)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('$store • $category', style: const TextStyle(color: Color(0xFF94a3b8))),
      ),
    );
  }
}
