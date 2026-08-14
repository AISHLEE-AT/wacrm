import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MoneyoScreen extends StatefulWidget {
  const MoneyoScreen({super.key});

  @override
  State<MoneyoScreen> createState() => _MoneyoScreenState();
}

class _MoneyoScreenState extends State<MoneyoScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  double _loanAmount = 50000;
  int _months = 12;
  final double _interestRate = 0.01;
  double _walletBalance = 3450.00;
  String _userUpiId = 'supro.customer@upi';

  static const String _adminPhone = '916381029380';

  final List<Map<String, dynamic>> _quickServices = const [
    {'name': 'Mobile Recharge', 'icon': LucideIcons.smartphone, 'color': Color(0xFF3B82F6)},
    {'name': 'TNEB Electricity', 'icon': LucideIcons.zap, 'color': Color(0xFFF59E0B)},
    {'name': 'DTH Recharge', 'icon': LucideIcons.tv, 'color': Color(0xFFEC4899)},
    {'name': 'FASTag Top-up', 'icon': LucideIcons.car, 'color': Color(0xFF10B981)},
    {'name': 'LPG Gas Cylinder', 'icon': LucideIcons.flame, 'color': Color(0xFFEF4444)},
    {'name': 'Water Tax', 'icon': LucideIcons.droplets, 'color': Color(0xFF06B6D4)},
  ];

  final List<Map<String, dynamic>> _recentTransactions = const [
    {
      'title': 'RideO Cab Payment',
      'subtitle': 'TN 49 AZ 7788 • To RAJA-D',
      'amount': '-₹123',
      'type': 'debit',
      'date': 'Today, 2:05 PM',
      'icon': LucideIcons.car,
    },
    {
      'title': 'Wallet Cashback Bonus',
      'subtitle': 'SuprO Deepam Reward',
      'amount': '+₹50',
      'type': 'credit',
      'date': 'Today, 11:30 AM',
      'icon': LucideIcons.gift,
    },
    {
      'title': 'RentO Tractor Advance',
      'subtitle': 'Field Plowing Service',
      'amount': '-₹500',
      'type': 'debit',
      'date': 'Yesterday',
      'icon': LucideIcons.tractor,
    },
    {
      'title': 'Kisan Micro-Credit Disbursal',
      'subtitle': 'Direct Bank Transfer to UPI',
      'amount': '+₹15,000',
      'type': 'credit',
      'date': '12 Aug 2026',
      'icon': LucideIcons.arrowDownLeft,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfileUpi();
  }

  Future<void> _loadProfileUpi() async {
    final prefs = await SharedPreferences.getInstance();
    final upi = prefs.getString('user_upi_id');
    if (upi != null && upi.isNotEmpty && mounted) {
      setState(() => _userUpiId = upi);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _applyForLoan(double amount, int months, int emi) async {
    final message = '💰 *SuprO MoneyO Instant Loan Application* 💰\n\n'
        '👤 *Applicant UPI:* $_userUpiId\n'
        '💵 *Loan Amount:* ₹${amount.toInt()}\n'
        '⏱️ *Tenure:* $months Months\n'
        '📊 *Estimated EMI:* ₹$emi / month\n\n'
        'Hi, I would like to apply for the instant 10-minute micro-loan. Please verify my KYC and disburse to my UPI.';

    final uri = Uri.parse('https://wa.me/$_adminPhone?text=${Uri.encodeComponent(message)}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open WhatsApp.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
        title: const Row(
          children: [
            Icon(LucideIcons.wallet, color: Color(0xFF14B8A6), size: 24),
            SizedBox(width: 10),
            Text('SuprO Pay & MoneyO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF14B8A6),
          labelColor: const Color(0xFF14B8A6),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(text: '💳 SuprO Pay'),
            Tab(text: '💰 Micro-Loans'),
            Tab(text: '📜 History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPayTab(),
          _buildLoansTab(),
          _buildHistoryTab(),
        ],
      ),
    );
  }

  Widget _buildPayTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ─── WALLET BALANCE CARD ───
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F766E), Color(0xFF134E4A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF14B8A6).withValues(alpha: 0.2),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Available Balance', style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 13, fontWeight: FontWeight.w500)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.shieldCheck, color: Color(0xFF5EEAD4), size: 14),
                        SizedBox(width: 4),
                        Text('UPI Protected', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text('₹${_walletBalance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Linked UPI ID: $_userUpiId', style: const TextStyle(color: Color(0xFF99F6E4), fontSize: 12)),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening UPI Payment gateway...')));
                      },
                      icon: const Icon(LucideIcons.plusCircle, size: 16),
                      label: const Text('Add Money'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0F766E),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening QR Scanner...')));
                      },
                      icon: const Icon(LucideIcons.qrCode, size: 16),
                      label: const Text('Scan QR'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
        const Text('Recharges & Bill Payments', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 1.0,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: _quickServices.length,
          itemBuilder: (context, index) {
            final s = _quickServices[index];
            return Container(
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Opening ${s['name']} portal...')));
                },
                borderRadius: BorderRadius.circular(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (s['color'] as Color).withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 22),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      s['name'] as String,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildLoansTab() {
    final totalInterest = _loanAmount * _interestRate * _months;
    final emi = ((_loanAmount + totalInterest) / _months).round();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF14B8A6).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF14B8A6)),
          ),
          child: const Row(
            children: [
              Icon(LucideIcons.sparkles, color: Color(0xFF14B8A6), size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  '10-Minute Kisan Credit & Micro-Loan\nZero collateral • Direct UPI transfer',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Loan Amount', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
            Text('₹${_loanAmount.toInt()}', style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: _loanAmount,
          min: 5000,
          max: 200000,
          divisions: 39,
          activeColor: const Color(0xFF14B8A6),
          inactiveColor: const Color(0xFF1E293B),
          onChanged: (val) => setState(() => _loanAmount = val),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Tenure (Duration)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
            Text('$_months Months', style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: _months.toDouble(),
          min: 3,
          max: 36,
          divisions: 11,
          activeColor: const Color(0xFF14B8A6),
          inactiveColor: const Color(0xFF1E293B),
          onChanged: (val) => setState(() => _months = val.toInt()),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            children: [
              const Text('Calculated Monthly EMI', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              const SizedBox(height: 6),
              Text('₹$emi / month', style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 32, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('Interest Rate: 1% p.m. • Total Repayment: ₹${(_loanAmount + totalInterest).toInt()}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _applyForLoan(_loanAmount, _months, emi),
                  icon: const Icon(LucideIcons.send, size: 16),
                  label: const Text('Apply & Disburse via WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF14B8A6),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _recentTransactions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final tx = _recentTransactions[index];
        final isCredit = tx['type'] == 'credit';
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isCredit ? const Color(0x2610B981) : const Color(0x26EF4444),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(tx['icon'] as IconData, color: isCredit ? const Color(0xFF10B981) : const Color(0xFFEF4444), size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tx['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(tx['subtitle'] as String, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    const SizedBox(height: 2),
                    Text(tx['date'] as String, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                  ],
                ),
              ),
              Text(
                tx['amount'] as String,
                style: TextStyle(
                  color: isCredit ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
