import 'package:flutter/material.dart';
import '../services/whatsapp_service.dart';

class TourOScreen extends StatefulWidget {
  const TourOScreen({super.key});

  @override
  State<TourOScreen> createState() => _TourOScreenState();
}

class _TourOScreenState extends State<TourOScreen> {
  String _selectedPackage = 'arupadaiveedu';
  int _passengersCount = 4;

  final Map<String, Map<String, dynamic>> _tourPackages = {
    'arupadaiveedu': {
      'title': 'அறுபடைவீடு ஆன்மீக பயணம் (Arupadaiveedu Murugan Circuit)',
      'subtitle': 'Palani, Tiruchendur, Swamimalai, Thiruthani, Madurai',
      'icon': '🕉️',
      'baseRate': 12500.0,
      'duration': '3 Days / 2 Nights',
      'vehicle': 'Innova / Ertiga / Tempo Traveller',
    },
    'rameswaram': {
      'title': 'இராமேஸ்வரம் & கன்னியாகுமரி தரிசனம் (Rameswaram & Kanyakumari)',
      'subtitle': 'Ramanathaswamy Temple, Dhanushkodi, Vivekananda Rock',
      'icon': '🌊',
      'baseRate': 14000.0,
      'duration': '3 Days / 2 Nights',
      'vehicle': 'AC SUV / Force Traveller',
    },
    'ooty_kodai': {
      'title': 'ஊட்டி & கொடைக்கானல் மலை சுற்றுலா (Ooty & Kodaikanal Hills)',
      'subtitle': 'Botanical Garden, Pykara, Pillar Rocks, Coaker Walk',
      'icon': '⛰️',
      'baseRate': 16500.0,
      'duration': '4 Days / 3 Nights',
      'vehicle': 'Ghat Road Expert Driver + Force Traveller',
    },
    'tanjore_chola': {
      'title': 'தஞ்சை பெரிய கோவில் & சோழ மண்டலம் (Tanjore Big Temple Circuit)',
      'subtitle': 'Brihadeeswarar Temple, Gangaikonda Cholapuram, Darasuram',
      'icon': '🛕',
      'baseRate': 8500.0,
      'duration': '2 Days / 1 Night',
      'vehicle': 'Sedan / SUV / Tempo',
    },
  };

  void _bookTourPackage() {
    final pkg = _tourPackages[_selectedPackage]!;
    final message = 
        '🕉️ *TOURO TAMIL NADU TEMPLE & HILL TOUR BOOKING* 🕉️\n\n'
        '🚩 *Selected Package*: ${pkg['title']}\n'
        '⏱️ *Duration*: ${pkg['duration']}\n'
        '🚘 *Vehicle Type*: ${pkg['vehicle']}\n'
        '👥 *Passengers*: $_passengersCount Persons\n\n'
        '💵 *Package Base Fare*: ₹${(pkg['baseRate'] as double).toStringAsFixed(0)}\n\n'
        '👉 Please confirm pickup date & driver assignment!';

    WhatsAppService.openWhatsApp(phone: '916381029380', message: message);
  }

  @override
  Widget build(BuildContext context) {
    final activePkg = _tourPackages[_selectedPackage]!;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('TourO - ஆன்மீக & சுற்றுலா பயணம்', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0369A1), Color(0xFF075985)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.cyanAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('🛕', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Tamil Nadu Temple & Hill Packages',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'அறுபடைவீடு, இராமேஸ்வரம் & மலைவாசஸ்தல சுற்றுலா',
                          style: TextStyle(color: Colors.cyanAccent, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('SELECT TOUR PACKAGE (சுற்றுலா பொதியை தேர்வுசெய்க):', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            ..._tourPackages.keys.map((pkgKey) {
              final item = _tourPackages[pkgKey]!;
              final isSelected = pkgKey == _selectedPackage;
              return GestureDetector(
                onTap: () => setState(() => _selectedPackage = pkgKey),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.cyan.withValues(alpha: 0.15) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.cyanAccent : Colors.white12,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(item['icon'] as String, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['title'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 2),
                            Text(item['subtitle'] as String, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            const SizedBox(height: 4),
                            Text('Duration: ${item['duration']}', style: const TextStyle(color: Colors.cyanAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      Text('₹${(item['baseRate'] as double).toStringAsFixed(0)}', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 16),

            // Passengers Counter
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
                  const Text('Passenger Count (பயணிகள் எண்ணிக்கை):', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent),
                        onPressed: () {
                          if (_passengersCount > 1) setState(() => _passengersCount--);
                        },
                      ),
                      Text('$_passengersCount Persons', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: Colors.cyanAccent),
                        onPressed: () => setState(() => _passengersCount++),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 1-Click Package Booking Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _bookTourPackage,
                icon: const Icon(Icons.chat, color: Colors.white),
                label: const Text(
                  'BOOK TOUR PACKAGE VIA WHATSAPP (1-CLICK)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7), // Sky Blue
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
