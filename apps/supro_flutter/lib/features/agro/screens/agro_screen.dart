import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../services/mandi_api_service.dart';
import '../../../shared/widgets/module_news_section.dart';

class AgroScreen extends StatefulWidget {
  const AgroScreen({super.key});

  @override
  State<AgroScreen> createState() => _AgroScreenState();
}

class _AgroScreenState extends State<AgroScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<MandiItem> _mandiPrices = [];
  bool _isLoadingMandi = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadMandi();
  }

  Future<void> _loadMandi() async {
    final prices = await MandiApiService.fetchMandiPrices();
    setState(() {
      _mandiPrices = prices;
      _isLoadingMandi = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('🌾 AgrO & Mandi'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10b981),
          labelColor: const Color(0xFF10b981),
          unselectedLabelColor: const Color(0xFF94a3b8),
          tabs: const [
            Tab(icon: Icon(LucideIcons.leaf), text: 'Mandi Rates'),
            Tab(icon: Icon(LucideIcons.newspaper), text: 'Today\'s News'),
            Tab(icon: Icon(LucideIcons.bell), text: 'Alerts'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMandiTab(),
          // ✅ Now uses Supabase daily news (admin-curated at 6 AM)
          const ModuleNewsSection(
            module: 'agro',
            emptyMessage:
                'No agriculture news for today yet.\nAdmin loads fresh news every morning at 6 AM.',
          ),
          _buildAlertsTab(),
        ],
      ),
    );
  }

  Widget _buildMandiTab() {
    if (_isLoadingMandi) {
      return const Center(
          child: CircularProgressIndicator(color: Color(0xFF10b981)));
    }
    if (_mandiPrices.isEmpty) {
      return const Center(
          child: Text('No mandi data available.',
              style: TextStyle(color: Colors.white)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _mandiPrices.length,
      itemBuilder: (context, index) {
        final item = _mandiPrices[index];
        return Card(
          color: const Color(0xFF1E293B),
          margin: const EdgeInsets.only(bottom: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: ListTile(
            leading: const Icon(LucideIcons.leaf,
                color: Color(0xFF10b981), size: 28),
            title: Text('${item.commodity} (${item.variety})',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text(
                '${item.market}, ${item.district}\nDate: ${item.arrivalDate}',
                style: const TextStyle(color: Color(0xFF94a3b8))),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('₹${item.modalPrice}/Qtl',
                    style: const TextStyle(
                        color: Color(0xFF10b981),
                        fontWeight: FontWeight.bold,
                        fontSize: 16)),
                Text('Min: ₹${item.minPrice}',
                    style: const TextStyle(
                        color: Color(0xFF64748b), fontSize: 10)),
              ],
            ),
            isThreeLine: true,
          ),
        );
      },
    );
  }

  Widget _buildAlertsTab() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0x2210b981),
            ),
            child: const Icon(LucideIcons.bellRing,
                size: 64, color: Color(0xFF10b981)),
          ),
          const SizedBox(height: 24),
          const Text(
            'Price Alerts',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white),
          ),
          const SizedBox(height: 16),
          const Text(
            'Set target prices for your crops. We will notify you when the local Mandi price crosses your threshold.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF94a3b8), fontSize: 14),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('New Alert Dialog Coming Soon!')));
            },
            icon: const Icon(LucideIcons.plus, color: Colors.black),
            label: const Text('Add New Alert',
                style: TextStyle(
                    color: Colors.black, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10b981),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}
