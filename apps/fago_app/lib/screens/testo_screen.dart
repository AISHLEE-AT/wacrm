import 'package:flutter/material.dart';
import '../services/whatsapp_service.dart';
import '../services/location_service.dart';
import '../features/profile/services/profile_service.dart';

class TestOScreen extends StatelessWidget {
  const TestOScreen({super.key});

  final List<Map<String, String>> _tests = const [
    {
      'title': 'தமிழ்நாடு காவலர் தேர்வு (TN Police Exam)',
      'subtitle': '50 MCQs • 60 Mins • GK, Maths & Tamil',
      'icon': '👮',
      'category': 'Government Exam',
    },
    {
      'title': 'வணிக ஓட்டுநர் உரிமம் மாதிரித் தேர்வு (Driving License Test)',
      'subtitle': '30 Questions • 30 Mins • Road Signs & Safety Rules',
      'icon': '🚦',
      'category': 'Driver Certification',
    },
    {
      'title': 'TNPSC குரூப் 4 மாதிரித் தேர்வு (TNPSC Group 4)',
      'subtitle': '100 MCQs • 120 Mins • General Studies & Aptitude',
      'icon': '📚',
      'category': 'Public Service',
    },
    {
      'title': 'NEET / JEE இயற்பியல் & வேதியியல் பயிற்சித் தேர்வு',
      'subtitle': '45 MCQs • 45 Mins • Physics & Chemistry Practice',
      'icon': '🔬',
      'category': 'Entrance Exam',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('TestO - ஆன்லைன் மாதிரித் தேர்வுகள்', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tests.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.lightBlueAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('📝', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'TestO Exam & Assessment Hub',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'அரசு தேர்வுகள் & ஓட்டுநர் சான்றிதழ் பயிற்சி மையம்',
                          style: TextStyle(color: Colors.lightBlueAccent, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          final item = _tests[index - 1];
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
                          color: Colors.cyan.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(item['category']!, style: const TextStyle(color: Colors.cyanAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () async {
                    final loc = await LocationService().getCurrentLocation();
                    final pinData = await LocationService().getPincodeAndAddressFromCoordinates(loc.latitude, loc.longitude);
                    final userDetails = await ProfileService.getCurrentUserProfileDetails();
                    final userName = userDetails['name'] ?? '';

                    StringBuffer sb = StringBuffer();
                    sb.writeln('📝 *TESTO EXAM & CERTIFICATION ACCESS*');
                    if (userName.isNotEmpty) sb.writeln('👤 *Candidate Name*: $userName');
                    sb.writeln('📚 *Test Title*: ${item['title']}');
                    sb.writeln('🏷️ *Category*: ${item['category']}');
                    sb.writeln('\n📍 *Candidate Location Pin*: ${pinData['address']}');
                    if (pinData['pincode']!.isNotEmpty) sb.writeln('📮 *Pincode*: ${pinData['pincode']}');
                    sb.writeln('🗺️ *Live GPS Maps Pin*: https://maps.google.com/?q=${loc.latitude},${loc.longitude}');

                    WhatsAppService.openWhatsApp(phone: '916381029380', message: sb.toString());
                  },
                  child: const Text('Start Test', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
