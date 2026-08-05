import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class TouroScreen extends StatelessWidget {
  const TouroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TourO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTourCard('Madurai Meenakshi Amman Temple', '1 Day Tour', '₹750 / Person'),
          _buildTourCard('Rameswaram Pilgrimage Yatra', '2 Day Tour', '₹2,500 / Person'),
        ],
      ),
    );
  }

  Widget _buildTourCard(String title, String duration, String price) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.compass, color: Color(0xFF06b6d4)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('$duration • $price', style: const TextStyle(color: Color(0xFF94a3b8))),
      ),
    );
  }
}
