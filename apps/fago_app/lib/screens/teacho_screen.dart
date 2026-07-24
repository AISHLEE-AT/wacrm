import 'package:flutter/material.dart';
import '../services/whatsapp_service.dart';
import '../services/location_service.dart';
import '../features/profile/services/profile_service.dart';

class TeachOScreen extends StatelessWidget {
  const TeachOScreen({super.key});

  final List<Map<String, String>> _courses = const [
    {
      'title': 'டிராக்டர் உழவு ஆழம் & ரோட்டவேட்டர் அமைத்தல்',
      'subtitle': 'Tractor Rotavator & Disc Plough Depth Calibration Guide',
      'icon': '🚜',
      'category': 'Agri Machinery',
    },
    {
      'title': 'சொட்டு நீர் பாசனம் & பம்ப் பராமரிப்பு',
      'subtitle': 'Drip Irrigation Filter Cleaning & Submersible Motor Fixes',
      'icon': '💧',
      'category': 'Water Management',
    },
    {
      'title': 'இயற்கை விவசாய பஞ்சகவ்விய & ஜீவாமிர்தம் தயாரிப்பு',
      'subtitle': 'Organic Panchagavya & Natural Bio-Fertilizer Formulas',
      'icon': '🍃',
      'category': 'Organic Farming',
    },
    {
      'title': 'வணிக ஓட்டுநர் உரிமம் & பேட்ஜ் அனுமதி வழிகாட்டி',
      'subtitle': 'Commercial Driving Permit Renewal & Road Safety Rules',
      'icon': '🚛',
      'category': 'Driver Skills',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('TeachO - விவசாய நுட்பங்கள் & பயிற்சி', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _courses.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.purpleAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('🎓', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'TeachO Skill & Agri-Tech Academy',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'விவசாய நுட்பங்கள் & ஓட்டுநர் திறன் பயிற்சிகள்',
                          style: TextStyle(color: Colors.purpleAccent, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          final item = _courses[index - 1];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                Text(item['icon']!, style: const TextStyle(fontSize: 30)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(item['subtitle']!, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.purple.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(item['category']!, style: const TextStyle(color: Colors.purpleAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.play_circle_fill, color: Colors.purpleAccent, size: 32),
                  onPressed: () async {
                    final loc = await LocationService().getCurrentLocation();
                    final pinData = await LocationService().getPincodeAndAddressFromCoordinates(loc.latitude, loc.longitude);
                    final userDetails = await ProfileService.getCurrentUserProfileDetails();
                    final userName = userDetails['name'] ?? '';

                    StringBuffer sb = StringBuffer();
                    sb.writeln('🎓 *TEACHO ACADEMY INQUIRY*');
                    if (userName.isNotEmpty) sb.writeln('👤 *Student Name*: $userName');
                    sb.writeln('📚 *Course Title*: ${item['title']}');
                    sb.writeln('🏷️ *Category*: ${item['category']}');
                    sb.writeln('\n📍 *Student Location Pin*: ${pinData['address']}');
                    if (pinData['pincode']!.isNotEmpty) sb.writeln('📮 *Pincode*: ${pinData['pincode']}');
                    sb.writeln('🗺️ *Live GPS Maps Pin*: https://maps.google.com/?q=${loc.latitude},${loc.longitude}');

                    WhatsAppService.openWhatsApp(phone: '916381029380', message: sb.toString());
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
