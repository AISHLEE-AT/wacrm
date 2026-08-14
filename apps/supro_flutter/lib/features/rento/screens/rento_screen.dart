import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:math';

class RentalItem {
  final String id;
  final String name;
  final String tamilName;
  final String rate;
  final String unit;
  final String desc;
  final IconData icon;

  const RentalItem({
    required this.id,
    required this.name,
    required this.tamilName,
    required this.rate,
    required this.unit,
    required this.desc,
    required this.icon,
  });
}

class RentoScreen extends StatefulWidget {
  const RentoScreen({super.key});

  @override
  State<RentoScreen> createState() => _RentoScreenState();
}

class _RentoScreenState extends State<RentoScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const String _adminPhone = '916381029380';

  final List<RentalItem> _agriEquipment = const [
    RentalItem(id: 'tractor_plow', name: 'Tractor (Plowing / Rotavator)', tamilName: 'டிராக்டர் (ஏர் உழுதல்)', rate: '₹450', unit: 'per hour', desc: 'Swaraj / Mahindra 45-50 HP', icon: LucideIcons.tractor),
    RentalItem(id: 'paddy_harvester', name: 'Paddy Harvester', tamilName: 'நெல் அறுவடை இயந்திரம்', rate: '₹1800', unit: 'per acre', desc: 'Track & Wheel Type Harvester', icon: LucideIcons.wheat),
    RentalItem(id: 'sugarcane_harvester', name: 'Sugarcane Harvester', tamilName: 'கரும்பு அறுவடை', rate: '₹2400', unit: 'per acre', desc: 'Heavy Duty Field Harvester', icon: LucideIcons.leaf),
    RentalItem(id: 'pesticide_drone', name: 'Pesticide Drone', tamilName: 'மருந்து தெளிக்கும் ட்ரோன்', rate: '₹350', unit: 'per acre', desc: 'Precision Agriculture Spraying', icon: LucideIcons.plane),
    RentalItem(id: 'power_tiller', name: 'Power Tiller / Weeder', tamilName: 'பவர் டில்லர்', rate: '₹250', unit: 'per hour', desc: 'Mini Tiller for Small Land', icon: LucideIcons.cog),
    RentalItem(id: 'agri_trailer', name: 'Agri Goods Trailer', tamilName: 'விவசாய டிரெய்லர்', rate: '₹300', unit: 'per hour', desc: 'Crop Transport from Field', icon: LucideIcons.truck),
  ];

  final List<RentalItem> _cargoVehicles = const [
    RentalItem(id: 'tata_ace', name: 'Tata Ace (Chota Hathi)', tamilName: 'டாடா ஏஸ்', rate: '₹250 + ₹18/km', unit: '750 kg capacity', desc: 'Ideal for Mandi Vegetables', icon: LucideIcons.truck),
    RentalItem(id: 'bolero_maxi', name: 'Bolero Maxi Truck', tamilName: 'போலிரோ மேக்ஸி', rate: '₹400 + ₹22/km', unit: '1.5 Tons', desc: 'Heavy Farm Produce & Paddy', icon: LucideIcons.truck),
    RentalItem(id: 'leyland_dost', name: 'Ashok Leyland Dost', tamilName: 'அசோக் லேலேண்ட்', rate: '₹450 + ₹24/km', unit: '1.8 Tons', desc: 'Inter-district Commercial Cargo', icon: LucideIcons.truck),
    RentalItem(id: 'eicher_lorry', name: 'Eicher 10.90 Lorry', tamilName: 'ஐச்சர் லாரி', rate: '₹900 + ₹38/km', unit: '5 Tons', desc: 'Bulk Mandi & Sugarcane Supply', icon: LucideIcons.container),
    RentalItem(id: 'tipper_10w', name: '10-Wheeler Tipper', tamilName: '10 சக்கர டிப்பர்', rate: '₹1800 + ₹65/km', unit: '15 Tons', desc: 'Heavy Soil & Material Supply', icon: LucideIcons.hardHat),
  ];

  final List<RentalItem> _hourlyPackages = const [
    RentalItem(id: 'pkg_2h20k', name: '2 Hours / 20 KM', tamilName: '2 மணி நேரம்', rate: '₹499 Sedan', unit: '₹799 SUV', desc: 'City Errands & Local Hospital visits', icon: LucideIcons.clock),
    RentalItem(id: 'pkg_4h40k', name: '4 Hours / 40 KM', tamilName: '4 மணி நேரம்', rate: '₹899 Sedan', unit: '₹1399 SUV', desc: 'Shopping, Meetings & Function travel', icon: LucideIcons.clock),
    RentalItem(id: 'pkg_8h80k', name: '8 Hours / 80 KM', tamilName: '8 மணி நேரம்', rate: '₹1699 Sedan', unit: '₹2499 SUV', desc: 'Full Day Outstation & Weddings', icon: LucideIcons.clock),
    RentalItem(id: 'pkg_12h120k', name: '12 Hours / 120 KM', tamilName: '12 மணி நேரம்', rate: '₹2399 Sedan', unit: '₹3499 SUV', desc: 'Long Inter-City Round Trip', icon: LucideIcons.clock),
  ];

  final List<RentalItem> _tourPackages = const [
    RentalItem(id: 'tour_ooty', name: 'Ooty Hill Station Tour', tamilName: 'ஊட்டி மலை சுற்றுலா', rate: '₹4500 / Day', unit: 'All Inclusive', desc: 'Tea Gardens, Lake, Botanical Garden', icon: LucideIcons.mountain),
    RentalItem(id: 'tour_kodai', name: 'Kodaikanal Hill Tour', tamilName: 'கொடைக்கானல் சுற்றுலா', rate: '₹4800 / Day', unit: 'All Inclusive', desc: 'Pillar Rocks, Lake, Coakers Walk', icon: LucideIcons.trees),
    RentalItem(id: 'tour_rameswaram', name: 'Rameswaram Temple & Sea', tamilName: 'ராமேஸ்வரம் ஆன்மீகம்', rate: '₹5200 / Day', unit: 'All Inclusive', desc: 'Temple Darshan & Dhanushkodi Beach', icon: LucideIcons.landmark),
    RentalItem(id: 'tour_girivalam', name: 'Thiruvannamalai Girivalam', tamilName: 'திருவண்ணாமலை கிரிவலம்', rate: '₹3800 / Day', unit: 'Special Darshan', desc: 'Full Moon Girivalam & Temple Cab', icon: LucideIcons.sun),
    RentalItem(id: 'tour_madurai_tanjore', name: 'Madurai & Tanjore Heritage', tamilName: 'மதுரை & தஞ்சை சுற்றுலா', rate: '₹4200 / Day', unit: 'Heritage Tour', desc: 'Meenakshi Temple & Big Temple', icon: LucideIcons.castle),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _bookItemViaWhatsApp(RentalItem item) async {
    final prefs = await SharedPreferences.getInstance();
    final userName = prefs.getString('user_name') ?? 'SuprO Customer';
    final userLocation = prefs.getString('user_location') ?? 'Thanjavur, Tamil Nadu';
    final userPhone = prefs.getString('user_phone') ?? '919344532738';
    final bookingCode = 'RENTO-${1000 + Random().nextInt(9000)}';
    final otp = '${1000 + Random().nextInt(9000)}';

    // 1. Insert into Supabase rento_bookings and rides for real-time driver partner matching
    try {
      final supabase = Supabase.instance.client;
      await supabase.from('rento_bookings').insert({
        'booking_code': bookingCode,
        'user_name': userName,
        'user_phone': userPhone,
        'vehicle_type': item.name,
        'pickup_address': userLocation,
        'pickup_lat': 10.7867,
        'pickup_lng': 79.1378,
        'destination_address': userLocation,
        'destination_lat': 10.7950,
        'destination_lng': 79.1450,
        'booking_type': 'instant',
        'estimated_fare': 500,
        'billing_unit': item.unit,
        'status': 'pending',
        'otp': otp,
      });

      await supabase.from('rides').insert({
        'passenger_phone': userPhone,
        'passenger_name': userName,
        'pickup_location': {'lat': 10.7867, 'lng': 79.1378, 'address': userLocation},
        'drop_location': {'lat': 10.7950, 'lng': 79.1450, 'address': userLocation},
        'vehicle_category': item.id,
        'fare': 500,
        'status': 'pending',
        'otp': otp,
      });
    } catch (e) {
      debugPrint('Supabase rento insert error (non-blocking): $e');
    }

    final message = '🚜 *SuprO RentO Booking Inquiry* 🚜\n\n'
        '👤 *Customer:* $userName ($userPhone)\n'
        '📍 *Location:* $userLocation\n'
        '🚜 *Item:* ${item.name} (${item.tamilName})\n'
        '💰 *Rate:* ${item.rate} (${item.unit})\n'
        '📝 *Details:* ${item.desc}\n'
        '🆔 *Booking Code:* $bookingCode\n\n'
        'Hi, I would like to confirm this RentO booking with an available operator!';

    final waUrl = Uri.parse('https://wa.me/$_adminPhone?text=${Uri.encodeComponent(message)}');
    final nativeUri = Uri.parse('whatsapp://send?phone=$_adminPhone&text=${Uri.encodeComponent(message)}');

    try {
      if (await canLaunchUrl(nativeUri)) {
        await launchUrl(nativeUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(waUrl, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      try {
        await launchUrl(waUrl, mode: LaunchMode.externalApplication);
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open WhatsApp.')));
        }
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
        title: const Text('RentO Marketplace', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10B981),
          labelColor: const Color(0xFF10B981),
          unselectedLabelColor: const Color(0xFF94A3B8),
          isScrollable: true,
          tabs: const [
            Tab(text: '🚜 Agri Equipment'),
            Tab(text: '🚚 Cargo & Trucks'),
            Tab(text: '⏱️ Hourly Rental'),
            Tab(text: '🏔️ Tour Packages'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildItemList(_agriEquipment),
          _buildItemList(_cargoVehicles),
          _buildItemList(_hourlyPackages),
          _buildItemList(_tourPackages),
        ],
      ),
    );
  }

  Widget _buildItemList(List<RentalItem> items) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = items[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0x2610B981),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(item.icon, color: const Color(0xFF10B981), size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(item.tamilName, style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(item.desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${item.rate} • ${item.unit}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        ElevatedButton.icon(
                          onPressed: () => _bookItemViaWhatsApp(item),
                          icon: const Icon(LucideIcons.messageCircle, size: 14),
                          label: const Text('Book'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
