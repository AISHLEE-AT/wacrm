import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'web_module_screen.dart';

class TvOScreen extends StatelessWidget {
  const TvOScreen({super.key});

  final List<Map<String, String>> _videos = const [
    {
      'title': 'டிராக்டர் பராமரிப்பு & ரோட்டவேட்டர் அமைக்கும் முறை',
      'subtitle': 'Tractor Maintenance & Rotavator Setup Guide',
      'category': 'Agri Machinery',
      'url': 'https://www.youtube.com/@AishleeTechnology',
      'icon': '🚜',
    },
    {
      'title': 'சொட்டு நீர் பாசனம் & பம்ப் மோட்டார் ரிப்பேர்',
      'subtitle': 'Drip Irrigation & Motor Repair Tips',
      'category': 'Water Management',
      'url': 'https://www.youtube.com/@AishleeTechnology',
      'icon': '💧',
    },
    {
      'title': 'இயற்கை விவசாயம்: பஞ்சகவ்விய தயாரிப்பு முறை',
      'subtitle': 'Organic Farming & Panchagavya Recipe',
      'category': 'Organic Agri',
      'url': 'https://www.youtube.com/@AishleeTechnology',
      'icon': '🍃',
    },
    {
      'title': 'வணிக ஓட்டுநர் உரிமம் & சாலை பாதுகாப்பு விதிமுறைகள்',
      'subtitle': 'Commercial Driving Permit & Road Safety Rules',
      'category': 'Driver Training',
      'url': 'https://www.youtube.com/@AishleeTechnology',
      'icon': '🚛',
    },
  ];

  Future<void> _openVideo(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('TvO - விவசாய & பயிற்சி வீடியோக்கள்', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Colors.redAccent),
            tooltip: 'Open Aishlee-Web Live TvO',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const WebModuleScreen(title: 'TvO - Aishlee Web Streaming', modulePath: 'tvo'),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _videos.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('📺', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'TvO Media & Video Streaming',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'விவசாய நுட்பங்கள், ரோட்டவேட்டர் & ஓட்டுநர் வீடியோக்கள்',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          final video = _videos[index - 1];
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
                Text(video['icon']!, style: const TextStyle(fontSize: 30)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(video['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(video['subtitle']!, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(video['category']!, style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.play_circle_fill, color: Colors.redAccent, size: 36),
                  onPressed: () => _openVideo(video['url']!),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
