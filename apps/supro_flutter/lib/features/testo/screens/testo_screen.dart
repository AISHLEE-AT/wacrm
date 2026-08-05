import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class TestoScreen extends StatelessWidget {
  const TestoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TestO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTestCard('TNPSC Group 4 Model Test', '100 Qs • 90 Mins'),
          _buildTestCard('TN Police Constable (PC)', '80 Qs • 60 Mins'),
        ],
      ),
    );
  }

  Widget _buildTestCard(String title, String desc) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.award, color: Color(0xFF8b5cf6)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(desc, style: const TextStyle(color: Color(0xFF94a3b8))),
      ),
    );
  }
}
