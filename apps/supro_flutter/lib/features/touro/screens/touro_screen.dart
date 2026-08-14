import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TourPackage {
  final String id;
  final String title;
  final String tamilTitle;
  final String duration;
  final String price;
  final String inclusions;
  final String description;
  final IconData icon;
  final String tag;

  const TourPackage({
    required this.id,
    required this.title,
    required this.tamilTitle,
    required this.duration,
    required this.price,
    required this.inclusions,
    required this.description,
    required this.icon,
    required this.tag,
  });
}

class TouroScreen extends StatefulWidget {
  const TouroScreen({super.key});

  @override
  State<TouroScreen> createState() => _TouroScreenState();
}

class _TouroScreenState extends State<TouroScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  static const String _adminPhone = '916381029380';

  final List<TourPackage> _templeTours = const [
    TourPackage(
      id: 'tour_girivalam',
      title: 'Thiruvannamalai Girivalam',
      tamilTitle: 'திருவண்ணாமலை கிரிவலம்',
      duration: '1 Night / 2 Days',
      price: '₹3,800',
      inclusions: 'Sedan Cab + Special Darshan + Guide',
      description: 'Full Moon Arunachaleswarar Temple Darshan, 14km Girivalam path assistance, and Ashram visit.',
      icon: LucideIcons.sun,
      tag: 'POPULAR',
    ),
    TourPackage(
      id: 'tour_rameswaram',
      title: 'Rameswaram & Dhanushkodi',
      tamilTitle: 'ராமேஸ்வரம் ஆன்மீகம்',
      duration: '2 Days / 1 Night',
      price: '₹5,200',
      inclusions: 'AC Cab + 22 Theertham Bath + Pamban Bridge',
      description: 'Ramanathaswamy Temple 22 Wells Sacred Bath, Agni Theertham, APJ Abdul Kalam Memorial & Dhanushkodi.',
      icon: LucideIcons.landmark,
      tag: 'SACRED',
    ),
    TourPackage(
      id: 'tour_madurai_tanjore',
      title: 'Madurai & Thanjavur Heritage',
      tamilTitle: 'மதுரை & தஞ்சை பாரம்பரியம்',
      duration: '2 Days / 1 Night',
      price: '₹4,500',
      inclusions: 'AC Cab + Brihadeeswarar + Meenakshi Amman',
      description: 'Thanjavur Big Temple UNESCO World Heritage tour and Madurai Meenakshi Temple evening Aarti.',
      icon: LucideIcons.castle,
      tag: 'HERITAGE',
    ),
    TourPackage(
      id: 'tour_palani',
      title: 'Palani Murugan Darshan',
      tamilTitle: 'பழனி முருகன் தரிசனம்',
      duration: '1 Day Tour',
      price: '₹3,200',
      inclusions: 'AC Sedan + Winch/Ropeway Ticket + Pooja Cab',
      description: 'Early morning Abhishekam darshan, Panchamirtham prasadam counter, and foothill drop.',
      icon: LucideIcons.sparkles,
      tag: 'DAILY',
    ),
  ];

  final List<TourPackage> _hillTours = const [
    TourPackage(
      id: 'tour_ooty',
      title: 'Ooty Queen of Hills',
      tamilTitle: 'ஊட்டி மலை சுற்றுலா',
      duration: '2 Days / 1 Night',
      price: '₹4,500',
      inclusions: 'Hill Cab + Botanical Garden + Tea Factory',
      description: 'Doddabetta Peak, Pykara Falls & Boating, Rose Garden, and Nilgiri Mountain Toy Train.',
      icon: LucideIcons.mountain,
      tag: 'HILL STATION',
    ),
    TourPackage(
      id: 'tour_kodai',
      title: 'Kodaikanal Princess of Hills',
      tamilTitle: 'கொடைக்கானல் சுற்றுலா',
      duration: '2 Days / 1 Night',
      price: '₹4,800',
      inclusions: 'Hill Cab + Coakers Walk + Pine Forest',
      description: 'Kodai Lake cycling, Pillar Rocks, Silver Cascade Falls, and Bryant Park floral garden.',
      icon: LucideIcons.trees,
      tag: 'ROMANTIC',
    ),
    TourPackage(
      id: 'tour_yercaud',
      title: 'Yercaud Jewel of the South',
      tamilTitle: 'ஏற்காடு மலை சுற்றுலா',
      duration: '1 Day Tour',
      price: '₹2,900',
      inclusions: 'AC Cab + 32 Hairpin Bends + Lady\'s Seat',
      description: 'Emerald Lake boating, Pagoda Point, Killiyur Falls, and Shevaroy Temple scenic viewpoint.',
      icon: LucideIcons.cloudFog,
      tag: 'WEEKEND',
    ),
  ];

  final List<TourPackage> _coastalTours = const [
    TourPackage(
      id: 'tour_pondy',
      title: 'Pondicherry French Colony',
      tamilTitle: 'பாண்டிச்சேரி சுற்றுலா',
      duration: '1 Day Tour',
      price: '₹2,800',
      inclusions: 'AC Cab + Promenade Beach + Auroville',
      description: 'French Quarter heritage walk, Matrimandir viewing point, Paradise Beach boat ride, and cafes.',
      icon: LucideIcons.waves,
      tag: 'BEACH',
    ),
    TourPackage(
      id: 'tour_kanyakumari',
      title: 'Kanyakumari Sunrise & Sunset',
      tamilTitle: 'கன்னியாகுமரி முக்கடல்',
      duration: '2 Days / 1 Night',
      price: '₹5,500',
      inclusions: 'AC Cab + Vivekananda Rock Ferry + Triveni Sangam',
      description: 'Tri-sea confluence bath, Thiruvalluvar Statue, Sunset viewpoint, and Padmanabhapuram Palace.',
      icon: LucideIcons.sunMedium,
      tag: 'COASTAL',
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

  void _bookTour(TourPackage tour) async {
    final prefs = await SharedPreferences.getInstance();
    final userName = prefs.getString('user_name') ?? 'SuprO Customer';
    final userPhone = prefs.getString('user_phone') ?? '919344532738';

    final message = '🏔️ *SuprO TourO Yatra Booking* 🏔️\n\n'
        '👤 *Customer:* $userName ($userPhone)\n'
        '📍 *Tour:* ${tour.title} (${tour.tamilTitle})\n'
        '⏱️ *Duration:* ${tour.duration}\n'
        '💰 *Price:* ${tour.price}\n'
        '✨ *Inclusions:* ${tour.inclusions}\n'
        '📝 *Description:* ${tour.description}\n\n'
        'Hi, I would like to book this tour package with a driver and itinerary. Please confirm available dates and vehicle details!';

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
            Icon(LucideIcons.compass, color: Color(0xFF06B6D4), size: 24),
            SizedBox(width: 10),
            Text('TourO Pilgrimage & Hills', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF06B6D4),
          labelColor: const Color(0xFF06B6D4),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(text: '🕉️ Temple Yatra'),
            Tab(text: '🏔️ Hill Stations'),
            Tab(text: '🌊 Coastal Escapes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTourList(_templeTours),
          _buildTourList(_hillTours),
          _buildTourList(_coastalTours),
        ],
      ),
    );
  }

  Widget _buildTourList(List<TourPackage> tours) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: tours.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final tour = tours[index];
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
                      color: const Color(0x2606B6D4),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(tour.icon, color: const Color(0xFF06B6D4), size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(tour.title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0x2606B6D4),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(tour.tag, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(tour.tamilTitle, style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text('${tour.duration} • ${tour.price}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0F1E),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('✨ Inclusions: ${tour.inclusions}', style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 11, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    Text(tour.description, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _bookTour(tour),
                  icon: const Icon(LucideIcons.messageCircle, size: 16),
                  label: const Text('Book Package via WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF06B6D4),
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
