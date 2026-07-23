import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/whatsapp_service.dart';

class MandiPricesScreen extends StatefulWidget {
  const MandiPricesScreen({super.key});

  @override
  State<MandiPricesScreen> createState() => _MandiPricesScreenState();
}

class _MandiPricesScreenState extends State<MandiPricesScreen> {
  String _selectedMandi = 'Oddanchatram';

  final Map<String, Map<String, dynamic>> _mandiData = {
    'Oddanchatram': {
      'name': 'ஒட்டன்சத்திரம் காய்கறி சந்தை (Oddanchatram)',
      'district': 'Dindigul',
      'commodities': [
        {'name': 'தக்காளி (Tomato)', 'price': '₹24 / kg', 'trend': 'up', 'change': '+₹2'},
        {'name': 'சின்ன வெங்காயம் (Small Onion)', 'price': '₹48 / kg', 'trend': 'stable', 'change': '0'},
        {'name': 'முருங்கைக்காய் (Drumstick)', 'price': '₹65 / kg', 'trend': 'up', 'change': '+₹5'},
        {'name': 'பச்சை மிளகாய் (Green Chilli)', 'price': '₹32 / kg', 'trend': 'down', 'change': '-₹3'},
        {'name': 'கத்தரிக்காய் (Brinjal)', 'price': '₹28 / kg', 'trend': 'stable', 'change': '0'},
      ]
    },
    'Coimbatore': {
      'name': 'கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை (Coimbatore MGR Market)',
      'district': 'Coimbatore',
      'commodities': [
        {'name': 'தக்காளி (Tomato)', 'price': '₹26 / kg', 'trend': 'up', 'change': '+₹3'},
        {'name': 'தேங்காய் (Coconut)', 'price': '₹18 / nut', 'trend': 'up', 'change': '+₹1'},
        {'name': 'உருளைக்கிழங்கு (Potato)', 'price': '₹35 / kg', 'trend': 'stable', 'change': '0'},
        {'name': 'கேரட் (Carrot)', 'price': '₹42 / kg', 'trend': 'down', 'change': '-₹2'},
      ]
    },
    'Madurai': {
      'name': 'மதுரை பரவை & சென்ட்ரல் சந்தை (Madurai Central Market)',
      'district': 'Madurai',
      'commodities': [
        {'name': 'சின்ன வெங்காயம் (Small Onion)', 'price': '₹52 / kg', 'trend': 'up', 'change': '+₹4'},
        {'name': 'மல்லிகை பூ (Jasmine Flower)', 'price': '₹450 / kg', 'trend': 'up', 'change': '+₹50'},
        {'name': 'தக்காளி (Tomato)', 'price': '₹25 / kg', 'trend': 'stable', 'change': '0'},
        {'name': 'வாழை இலை (Plantain Leaf)', 'price': '₹3.50 / piece', 'trend': 'stable', 'change': '0'},
      ]
    },
    'Trichy': {
      'name': 'திருச்சி காந்தி மார்க்கெட் (Trichy Gandhi Market)',
      'district': 'Tiruchirappalli',
      'commodities': [
        {'name': 'நெல் (Paddy - Ponni)', 'price': '₹1,420 / 60kg bag', 'trend': 'up', 'change': '+₹30'},
        {'name': 'வாழைப்பழம் (Poovan Banana)', 'price': '₹350 / comb', 'trend': 'stable', 'change': '0'},
        {'name': 'வெங்காயம் (Big Onion)', 'price': '₹30 / kg', 'trend': 'down', 'change': '-₹2'},
      ]
    },
    'Koyambedu': {
      'name': 'சென்னை கோயம்பேடு சந்தை (Koyambedu Wholesale Market)',
      'district': 'Chennai',
      'commodities': [
        {'name': 'தக்காளி (Tomato)', 'price': '₹28 / kg', 'trend': 'up', 'change': '+₹2'},
        {'name': 'வெங்காயம் (Onion)', 'price': '₹32 / kg', 'trend': 'stable', 'change': '0'},
        {'name': 'இஞ்சி (Ginger)', 'price': '₹110 / kg', 'trend': 'up', 'change': '+₹10'},
        {'name': 'பூண்டு (Garlic)', 'price': '₹180 / kg', 'trend': 'stable', 'change': '0'},
      ]
    },
  };

  void _bookMandiTransport(String mandiName) {
    final message = 
        '🚛 *UZHAVAR SANDHAI & MANDI TRANSPORT BOOKING* 🚛\n\n'
        '📌 *Target Mandi Market*: $mandiName\n'
        '📦 *Requirement*: Agricultural Produce Goods Transport (Tata Ace / Bolero Pickup)\n'
        '📍 *Farm Pickup*: Please dispatch nearest empty mini-van to my farm location.\n\n'
        '👉 Please confirm pickup time & estimated freight fare!';

    WhatsAppService.openWhatsApp(phone: '916381029380', message: message);
  }

  @override
  Widget build(BuildContext context) {
    final currentData = _mandiData[_selectedMandi]!;
    final commodities = currentData['commodities'] as List<dynamic>;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('உழவர் சந்தை & காய்கறி விலை', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                  colors: [Color(0xFF15803D), Color(0xFF166534)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('🥬', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Tamil Nadu Daily Mandi Prices',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'தமிழ்நாடு காய்கறி & விவசாய பொருட்கள் அன்றாட விலை',
                          style: TextStyle(color: Colors.greenAccent, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Mandi Chips Selector
            const Text('SELECT MARKET (சந்தையை தேர்வுசெய்க):', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _mandiData.keys.map((key) {
                  final isSelected = key == _selectedMandi;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      selected: isSelected,
                      label: Text(key, style: TextStyle(color: isSelected ? Colors.black : Colors.white, fontWeight: FontWeight.bold)),
                      selectedColor: const Color(0xFF22C55E),
                      backgroundColor: const Color(0xFF1E293B),
                      onSelected: (val) {
                        if (val) setState(() => _selectedMandi = key);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // Active Market Info Header
            Text(
              currentData['name'] as String,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            // Commodity List
            ...commodities.map((item) {
              final isUp = item['trend'] == 'up';
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(item['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Row(
                      children: [
                        Text(item['price'] as String, style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 15)),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isUp ? Colors.green.withValues(alpha: 0.2) : Colors.grey.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item['change'] as String,
                            style: TextStyle(color: isUp ? Colors.greenAccent : Colors.grey, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 20),

            // 1-Click Mandi Transport Load Booking Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () => _bookMandiTransport(currentData['name'] as String),
                icon: const Icon(Icons.local_shipping, color: Colors.white),
                label: const Text(
                  'BOOK MINI-VAN TO THIS MANDI VIA WHATSAPP',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF97316), // Orange
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
