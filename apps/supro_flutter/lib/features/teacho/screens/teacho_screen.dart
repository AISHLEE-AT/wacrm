import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class TeachoScreen extends StatelessWidget {
  const TeachoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TeachO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildCourseCard('TNPSC Group 4 Mastery', 'Competitive Exams', '120 Video Lessons'),
          _buildCourseCard('Spoken English 30 Days', 'Language', '30 Video Lessons'),
        ],
      ),
    );
  }

  Widget _buildCourseCard(String title, String cat, String desc) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.graduationCap, color: Color(0xFFf59e0b)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('$cat • $desc', style: const TextStyle(color: Color(0xFF94a3b8))),
      ),
    );
  }
}
