import 'package:flutter/material.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('Admin CRM'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: const Center(
        child: Text('Admin Dashboard Analytics Here', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}
