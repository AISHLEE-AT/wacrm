import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DealItem {
  final String id;
  final String title;
  final String tamilTitle;
  final String storeName;
  final String category;
  final String originalPrice;
  final String dealPrice;
  final String discount;
  final String validTill;
  final IconData icon;
  final String couponCode;

  const DealItem({
    required this.id,
    required this.title,
    required this.tamilTitle,
    required this.storeName,
    required this.category,
    required this.originalPrice,
    required this.dealPrice,
    required this.discount,
    required this.validTill,
    required this.icon,
    required this.couponCode,
  });
}

class DealoScreen extends StatefulWidget {
  const DealoScreen({super.key});

  @override
  State<DealoScreen> createState() => _DealoScreenState();
}

class _DealoScreenState extends State<DealoScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  static const String _adminPhone = '916381029380';

  final List<DealItem> _groceryDeals = const [
    DealItem(
      id: 'deal_rice',
      title: 'Bapatla Ponni Rice 25kg Bag',
      tamilTitle: 'பொன்னி அரிசி 25 கிலோ பை',
      storeName: 'Sri Amman Modern Rice Mill',
      category: 'Farm Direct',
      originalPrice: '₹1,450',
      dealPrice: '₹1,199',
      discount: '17% OFF',
      validTill: 'Valid till Sunday',
      icon: LucideIcons.wheat,
      couponCode: 'SUPRO-RICE',
    ),
    DealItem(
      id: 'deal_oil',
      title: 'Wood Pressed Groundnut Oil 5L',
      tamilTitle: 'மரச்செக்கு கடலை எண்ணெய்',
      storeName: 'Namma Marachekku Oil',
      category: 'Organic Grocery',
      originalPrice: '₹1,200',
      dealPrice: '₹950',
      discount: '21% OFF',
      validTill: 'Limited Stock',
      icon: LucideIcons.droplet,
      couponCode: 'PURE-OIL',
    ),
    DealItem(
      id: 'deal_veggie_box',
      title: 'Organic Farm Fresh Veggie Basket (7kg)',
      tamilTitle: 'இயற்கை காய்கறி கூடை',
      storeName: 'Uzhavar Santhai Direct',
      category: 'Daily Harvest',
      originalPrice: '₹400',
      dealPrice: '₹280',
      discount: '30% OFF',
      validTill: 'Daily Morning',
      icon: LucideIcons.salad,
      couponCode: 'FARM-FRESH',
    ),
  ];

  final List<DealItem> _electronicsDeals = const [
    DealItem(
      id: 'deal_solar_pump',
      title: '5 HP Solar Agri Water Pump Controller',
      tamilTitle: 'சோலார் மோட்டார் பம்ப்',
      storeName: 'Surya Green Tech Thanjavur',
      category: 'Agri Solar',
      originalPrice: '₹45,000',
      dealPrice: '₹36,999',
      discount: '₹8,000 OFF',
      validTill: 'Govt Subsidy Eligible',
      icon: LucideIcons.sun,
      couponCode: 'SOLAR-KIZH',
    ),
    DealItem(
      id: 'deal_sprayer',
      title: '16L Battery Operated Crop Sprayer',
      tamilTitle: 'பேட்டரி மருந்து தெளிப்பான்',
      storeName: 'Kisan Power Tools',
      category: 'Machinery',
      originalPrice: '₹3,500',
      dealPrice: '₹2,399',
      discount: '31% OFF',
      validTill: 'Festival Deal',
      icon: LucideIcons.wrench,
      couponCode: 'KISAN-SPRAY',
    ),
  ];

  final List<DealItem> _servicesDeals = const [
    DealItem(
      id: 'deal_bike_service',
      title: 'Complete Bike Service & Oil Change',
      tamilTitle: 'பைக் முழு சர்வீஸ்',
      storeName: 'Speedo Moto Care',
      category: 'Automotive',
      originalPrice: '₹750',
      dealPrice: '₹499',
      discount: '33% OFF',
      validTill: 'Doorstep Service',
      icon: LucideIcons.bike,
      couponCode: 'BIKE-499',
    ),
    DealItem(
      id: 'deal_soil_test',
      title: 'Digital Soil NPK & pH Quality Test',
      tamilTitle: 'மண் பரிசோதனை',
      storeName: 'Krishi Vigyan Kendra Partner',
      category: 'Farming Lab',
      originalPrice: '₹600',
      dealPrice: '₹250',
      discount: '58% OFF',
      validTill: 'Report in 24h',
      icon: LucideIcons.flaskConical,
      couponCode: 'SOIL-TEST',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _claimDeal(DealItem deal) async {
    final prefs = await SharedPreferences.getInstance();
    final userName = prefs.getString('user_name') ?? 'SuprO Customer';
    final userPhone = prefs.getString('user_phone') ?? '919344532738';

    final message = '🏷️ *SuprO DealO Coupon Claim* 🏷️\n\n'
        '👤 *Customer:* $userName ($userPhone)\n'
        '🏷️ *Deal:* ${deal.title} (${deal.tamilTitle})\n'
        '🏪 *Merchant:* ${deal.storeName}\n'
        '💰 *Offer Price:* ${deal.dealPrice} (Was ${deal.originalPrice} - ${deal.discount})\n'
        '🎟️ *Coupon Code:* ${deal.couponCode}\n\n'
        'Hi, I would like to redeem this DealO offer. Please confirm product availability and doorstep delivery / pickup!';

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
            Icon(LucideIcons.tag, color: Color(0xFFF97316), size: 24),
            SizedBox(width: 10),
            Text('DealO Marketplace', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFF97316),
          labelColor: const Color(0xFFF97316),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(text: '🌾 Farm & Grocery'),
            Tab(text: '⚙️ Agri Tech & Tools'),
            Tab(text: '🛠️ Local Services'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDealList(_groceryDeals),
          _buildDealList(_electronicsDeals),
          _buildDealList(_servicesDeals),
        ],
      ),
    );
  }

  Widget _buildDealList(List<DealItem> deals) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: deals.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final deal = deals[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0x26F97316),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(deal.icon, color: const Color(0xFFF97316), size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0x26F97316),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(deal.discount, style: const TextStyle(color: Color(0xFFF97316), fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                            Text(deal.validTill, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(deal.title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(deal.tamilTitle, style: const TextStyle(color: Color(0xFFF97316), fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Text('🏪 ${deal.storeName}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0F1E),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(deal.dealPrice, style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Text(deal.originalPrice, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, decoration: TextDecoration.lineThrough)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFF334155), style: BorderStyle.solid),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('🎟️ ${deal.couponCode}', style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 11, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _claimDeal(deal),
                  icon: const Icon(LucideIcons.shoppingBag, size: 16),
                  label: const Text('Claim Deal via WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF97316),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
