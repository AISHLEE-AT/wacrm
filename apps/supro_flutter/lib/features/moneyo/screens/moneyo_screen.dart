import 'package:flutter/material.dart';
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
