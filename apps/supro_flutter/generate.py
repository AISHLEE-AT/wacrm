# -*- coding: utf-8 -*-
import os

files = {
    'admin': '''import 'package:flutter/material.dart';

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
''',

    'dealo': '''import 'package:flutter/material.dart';
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
          _buildDealCard('Buy 1 Get 1 Free Pizza', 'Domino\\'s', 'Food'),
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
''',

    'teacho': '''import 'package:flutter/material.dart';
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
''',

    'rento': '''import 'package:flutter/material.dart';
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
''',

    'agro': '''import 'package:flutter/material.dart';
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
          const Text('Today\\'s Mandi Rates', style: TextStyle(color: Color(0xFF10b981), fontSize: 18, fontWeight: FontWeight.bold)),
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
''',

    'touro': '''import 'package:flutter/material.dart';
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
''',

    'testo': '''import 'package:flutter/material.dart';
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
''',

    'tvo': '''import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class TvoScreen extends StatelessWidget {
  const TvoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TvO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTvCard('Thamizhan News Live', 'News & Current Affairs'),
          _buildTvCard('Uzhavan Agri TV', 'Agriculture & Farming Tips'),
        ],
      ),
    );
  }

  Widget _buildTvCard(String title, String type) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: const Icon(LucideIcons.monitorPlay, color: Color(0xFFec4899)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(type, style: const TextStyle(color: Color(0xFF94a3b8))),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: Colors.red.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
          child: const Text('LIVE', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
''',

    'moneyo': '''import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class MoneyoScreen extends StatefulWidget {
  const MoneyoScreen({super.key});

  @override
  State<MoneyoScreen> createState() => _MoneyoScreenState();
}

class _MoneyoScreenState extends State<MoneyoScreen> {
  double _loanAmount = 50000;
  int _months = 12;
  final double _interestRate = 0.01;

  @override
  Widget build(BuildContext context) {
    final totalInterest = _loanAmount * _interestRate * _months;
    final emi = ((_loanAmount + totalInterest) / _months).round();

    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('MoneyO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(LucideIcons.wallet, size: 64, color: Color(0xFF14b8a6)),
            const SizedBox(height: 24),
            Text('Loan Amount: ₹${_loanAmount.toInt()}', style: const TextStyle(color: Colors.white, fontSize: 18)),
            Slider(
              value: _loanAmount,
              min: 5000,
              max: 200000,
              activeColor: const Color(0xFF14b8a6),
              onChanged: (val) => setState(() => _loanAmount = val),
            ),
            const SizedBox(height: 16),
            Text('Duration: $_months Months', style: const TextStyle(color: Colors.white, fontSize: 18)),
            Slider(
              value: _months.toDouble(),
              min: 3,
              max: 36,
              activeColor: const Color(0xFF14b8a6),
              onChanged: (val) => setState(() => _months = val.toInt()),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF14b8a6)),
              ),
              child: Column(
                children: [
                  const Text('Estimated EMI', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 16)),
                  const SizedBox(height: 8),
                  Text('₹$emi / month', style: const TextStyle(color: Color(0xFF14b8a6), fontSize: 32, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
'''
}

for module, content in files.items():
    path = f"lib/features/{module}/screens/{module}_screen.dart"
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully!")
