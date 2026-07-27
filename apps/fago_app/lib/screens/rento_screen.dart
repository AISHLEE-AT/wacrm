import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../features/profile/services/profile_service.dart';
import 'web_module_screen.dart';

class RentOScreen extends StatefulWidget {
  const RentOScreen({super.key});

  @override
  State<RentOScreen> createState() => _RentOScreenState();
}

class _RentOScreenState extends State<RentOScreen> {
  Location? _currentLocation;
  String _currentAddress = 'Detecting Farm GPS Location...';
  String _selectedCategory = 'Tractor';
  int _workingHoursOrAcres = 2; // Default 2 hours / acres
  final double _extraTip = 0.0;

  final TextEditingController _farmerNameController = TextEditingController();
  final TextEditingController _farmerPhoneController = TextEditingController(text: '+91');
  final TextEditingController _villageController = TextEditingController();

  final Map<String, Map<String, dynamic>> _machineryCategories = {
    'Tractor': {
      'title': 'உழவு டிராக்டர் (Tractor)',
      'subtitle': 'Rotavator, Cultivator, Disc Ploughing',
      'icon': Icons.agriculture,
      'color': Colors.orange,
      'baseRate': 700.0, // ₹700 / hour
      'unit': 'Hour',
    },
    'Harvester': {
      'title': 'அறுவடை இயந்திரம் (Harvester)',
      'subtitle': 'Paddy, Sugarcane, Maize Harvester',
      'icon': Icons.grass,
      'color': Colors.green,
      'baseRate': 1800.0, // ₹1800 / hour
      'unit': 'Hour',
    },
    'MiniVan': {
      'title': 'சரக்கு வாகனம் (Mini-Van / Pickup)',
      'subtitle': 'Tata Ace, Bolero to Uzhavar Shandhai / Mandi',
      'icon': Icons.local_shipping,
      'color': Colors.blue,
      'baseRate': 500.0, // ₹500 base
      'unit': 'Trip',
    },
    'PowerTiller': {
      'title': 'பவர் டில்லர் (Power Tiller)',
      'subtitle': 'Small field tilling & pesticide sprayer',
      'icon': Icons.build,
      'color': Colors.amber,
      'baseRate': 400.0, // ₹400 / day
      'unit': 'Day',
    },
    'WaterTanker': {
      'title': 'தண்ணீர் டேங்கர் (Water Tanker)',
      'subtitle': '5000L / 10000L Farm & Domestic Water Supply',
      'icon': Icons.water_drop,
      'color': Colors.cyan,
      'baseRate': 800.0, // ₹800 / load
      'unit': 'Load',
    },
  };

  @override
  void initState() {
    super.initState();
    _fetchFarmLocation();
  }

  Future<void> _fetchFarmLocation() async {
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    final profile = await ProfileService.getCurrentUserProfileDetails();
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
        _villageController.text = address;
        final user = Supabase.instance.client.auth.currentUser;
        final rawEmailPhone = (user?.email != null && user!.email!.contains('@whatsapp.wacrm.local'))
            ? user.email!.split('@')[0].replaceAll(RegExp(r'\D'), '')
            : '';
        final rawPhone = (profile['phone']?.isNotEmpty == true) ? profile['phone']! : rawEmailPhone;
        final phone10 = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
        final resolvedName = (profile['name'] != null && profile['name']!.isNotEmpty && profile['name'] != 'User' && profile['name'] != 'FAGO User')
            ? profile['name']!
            : (phone10.isNotEmpty ? 'User ${phone10.substring(phone10.length > 4 ? phone10.length - 4 : 0)}' : 'Farmer');

        if (_farmerNameController.text.isEmpty) _farmerNameController.text = resolvedName;
        if (_farmerPhoneController.text.isEmpty || _farmerPhoneController.text == '+91') {
          _farmerPhoneController.text = phone10.isNotEmpty ? '+91 $phone10' : '';
        }
      });
    }
  }

  double _calculateRent() {
    final cat = _machineryCategories[_selectedCategory]!;
    final baseRate = (cat['baseRate'] as double);
    return (baseRate * _workingHoursOrAcres) + _extraTip;
  }

  String _selectedMachineId = 'MACH_01';

  final List<Map<String, dynamic>> _virtualMachineryList = [
    {
      'id': 'MACH_01',
      'name': 'Mahindra 575 DI Tractor + Rotavator',
      'category': 'Tractor',
      'operator': 'Farmer Murugan',
      'phone': '9789012345',
      'rate': 700.0,
      'specs': '50 HP • 4WD • Rotary Tiller Attachment',
      'rating': 4.9,
      'distance': '1.8 km',
      'eta': '10 mins',
    },
    {
      'id': 'MACH_02',
      'name': 'Kubota DC68G Paddy Harvester',
      'category': 'Harvester',
      'operator': 'Captain Senthil Kumar',
      'phone': '9486335870',
      'rate': 1800.0,
      'specs': '68 HP • Rubber Track Crawler',
      'rating': 5.0,
      'distance': '3.2 km',
      'eta': '15 mins',
    },
    {
      'id': 'MACH_03',
      'name': 'Tata Ace Gold Agri Mini-Van',
      'category': 'MiniVan',
      'operator': 'Driver Rajesh',
      'phone': '9894012345',
      'rate': 500.0,
      'specs': '750 kg Payload • Crop Transport to Mandi',
      'rating': 4.7,
      'distance': '2.1 km',
      'eta': '12 mins',
    },
  ];

  Future<void> _bookMachineryViaWhatsApp() async {
    _currentLocation ??= await LocationService().getCurrentLocation();
    final lat = _currentLocation?.latitude ?? 11.0168;
    final lng = _currentLocation?.longitude ?? 76.9558;
    final pinData = await LocationService().getPincodeAndAddressFromCoordinates(lat, lng);

    final profile = await ProfileService.getCurrentUserProfileDetails();
    final cat = _machineryCategories[_selectedCategory]!;
    final farmerName = _farmerNameController.text.trim().isNotEmpty
        ? _farmerNameController.text.trim()
        : (profile['name']?.isNotEmpty == true ? profile['name']! : 'Customer');
    final farmerPhone = _farmerPhoneController.text.trim().isNotEmpty
        ? _farmerPhoneController.text.trim()
        : (profile['phone']?.isNotEmpty == true ? '+91${profile['phone']!}' : '');
    final locationText = _villageController.text.trim().isEmpty ? pinData['address']! : _villageController.text.trim();
    
    final selectedMach = _virtualMachineryList.firstWhere((m) => m['id'] == _selectedMachineId, orElse: () => _virtualMachineryList[0]);
    final totalRent = (selectedMach['rate'] as double) * _workingHoursOrAcres;

    final StringBuffer sb = StringBuffer();
    sb.writeln('🌾 *RENTO AGRICULTURAL & HEAVY MACHINERY BOOKING* 🌾\n');
    sb.writeln('👤 *Farmer / Customer*: $farmerName');
    sb.writeln('📞 *Cell / WhatsApp*: $farmerPhone');
    sb.writeln('🚜 *Chosen Machine*: ${selectedMach['name']}');
    sb.writeln('👨‍🌾 *Assigned Operator*: ${selectedMach['operator']} (+91 ${selectedMach['phone']})');
    sb.writeln('⏱️ *Requirement*: $_workingHoursOrAcres ${cat['unit']}(s)');
    sb.writeln('📍 *Farm Address*: $locationText');
    if (pinData['pincode']!.isNotEmpty) {
      sb.writeln('📮 *Pincode*: ${pinData['pincode']}');
    }
    sb.writeln('🗺️ *Live GPS Maps Pin*: https://maps.google.com/?q=$lat,$lng');
    sb.writeln('\n💵 *Committed Total Rent*: ₹${totalRent.toStringAsFixed(0)} (Base Rate: ₹${(selectedMach['rate'] as double).toStringAsFixed(0)}/${cat['unit']})');
    sb.writeln('\n👉 Operator: Tap to confirm machinery dispatch on WhatsApp!');

    WhatsAppService.openWhatsApp(phone: '91${selectedMach['phone']}', message: sb.toString());
  }

  @override
  Widget build(BuildContext context) {
    final cat = _machineryCategories[_selectedCategory]!;
    final totalRent = _calculateRent();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('RentO - விவசாய இயந்திர வாடகை', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Colors.greenAccent),
            tooltip: 'Open Aishlee-Web RentO',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const WebModuleScreen(title: 'RentO - Aishlee Web Agri Rentals', modulePath: 'rento'),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.my_location, color: Colors.greenAccent),
            onPressed: _fetchFarmLocation,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF166534), Color(0xFF14532D)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('🚜', style: TextStyle(fontSize: 40)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Tamil Nadu Local Machine Rentals',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'உழவு, அறுவடை & சந்தை போக்குவரத்து இயந்திரங்கள்',
                          style: TextStyle(color: Colors.greenAccent, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Select Machinery Category
            const Text(
              'SELECT MACHINERY CATEGORY (இயந்திரத்தை தேர்வுசெய்க):',
              style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.1),
            ),
            const SizedBox(height: 10),

            ..._machineryCategories.keys.map((catKey) {
              final item = _machineryCategories[catKey]!;
              final isSelected = catKey == _selectedCategory;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = catKey),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSelected ? (item['color'] as Color).withValues(alpha: 0.15) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? (item['color'] as Color) : Colors.white12,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(item['icon'] as IconData, color: item['color'] as Color, size: 30),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(item['title'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                                  child: const Text('AVAILABLE NOW', style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            Text(item['subtitle'] as String, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                          ],
                        ),
                      ),
                      Text(
                        '₹${(item['baseRate'] as double).toStringAsFixed(0)} / ${item['unit']}',
                        style: TextStyle(color: item['color'] as Color, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 16),

            // Working Hours / Acres Counter
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Requirement (${cat['unit']}s):',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent),
                        onPressed: () {
                          if (_workingHoursOrAcres > 1) {
                            setState(() => _workingHoursOrAcres--);
                          }
                        },
                      ),
                      Text(
                        '$_workingHoursOrAcres ${cat['unit']}(s)',
                        style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: Colors.greenAccent),
                        onPressed: () => setState(() => _workingHoursOrAcres++),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Farmer Contact Details
            const Text('FARMER DETAILS (விவசாயி விவரங்கள்):', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _farmerNameController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Farmer Name (விவசாயி பெயர்)',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),

            TextField(
              controller: _villageController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Village / Farm Address (கிராமம் / தோட்டம்)',
                hintStyle: const TextStyle(color: Colors.white38),
                helperText: '📍 Live GPS: $_currentAddress',
                helperStyle: const TextStyle(color: Colors.greenAccent, fontSize: 10),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),

            // Calculated Rent Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Estimated Rent:', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      Text('$_workingHoursOrAcres ${cat['unit']}(s) @ ₹${(cat['baseRate'] as double).toStringAsFixed(0)}/${cat['unit']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                    ],
                  ),
                  Text(
                    '₹${totalRent.toStringAsFixed(0)}',
                    style: const TextStyle(color: Colors.greenAccent, fontSize: 24, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Book Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _bookMachineryViaWhatsApp,
                icon: const Icon(Icons.chat, color: Colors.white),
                label: const Text(
                  'BOOK MACHINERY VIA WHATSAPP (1-CLICK)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
