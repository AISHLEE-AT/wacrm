import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

class TvChannel {
  final String id;
  final String title;
  final String tamilTitle;
  final String category;
  final String description;
  final String videoUrl;
  final IconData icon;
  final bool isLive;
  final String viewers;

  const TvChannel({
    required this.id,
    required this.title,
    required this.tamilTitle,
    required this.category,
    required this.description,
    required this.videoUrl,
    required this.icon,
    this.isLive = false,
    required this.viewers,
  });
}

class TvoScreen extends StatefulWidget {
  const TvoScreen({super.key});

  @override
  State<TvoScreen> createState() => _TvoScreenState();
}

class _TvoScreenState extends State<TvoScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<TvChannel> _liveNews = const [
    TvChannel(
      id: 'news_1',
      title: 'Tamil Daily Morning Bulletin Live',
      tamilTitle: 'தமிழ் காலை நேரடி செய்திகள்',
      category: 'News Live',
      description: 'Daily statewide weather, mandi commodity trends, and government agriculture schemes update.',
      videoUrl: 'https://www.youtube.com/watch?v=live_demo_news',
      icon: LucideIcons.newspaper,
      isLive: true,
      viewers: '2.4K Watching',
    ),
    TvChannel(
      id: 'news_2',
      title: 'Cauvery Delta Water & Crop Report',
      tamilTitle: 'காவிரி டெல்டா பாசன நிலவரம்',
      category: 'Delta Live',
      description: 'Mettur Dam inflow, river discharge levels, and Kuruvai crop harvesting progress report.',
      videoUrl: 'https://www.youtube.com/watch?v=live_delta_update',
      icon: LucideIcons.droplets,
      isLive: true,
      viewers: '1.1K Watching',
    ),
  ];

  final List<TvChannel> _agriChannels = const [
    TvChannel(
      id: 'agri_1',
      title: 'Uzhavan Agri TV: High-Yield Paddy Secrets',
      tamilTitle: 'உழவன் டிவி: அதிக மகசூல் நெல் சாகுபடி',
      category: 'Farming Masterclass',
      description: 'Dr. Nammalvar natural farming techniques, Panchagavya preparation, and bio-fertilizer guide.',
      videoUrl: 'https://www.youtube.com/watch?v=demo_agri_guide',
      icon: LucideIcons.wheat,
      viewers: '14.2K Views',
    ),
    TvChannel(
      id: 'agri_2',
      title: 'Precision Drone Spraying in Field',
      tamilTitle: 'ட்ரோன் மூலம் மருந்து தெளிப்பது எப்படி?',
      category: 'Agri Drone',
      description: 'Step-by-step operating guidelines for agri spraying drones covering 10 acres per hour.',
      videoUrl: 'https://www.youtube.com/watch?v=demo_drone_spray',
      icon: LucideIcons.plane,
      viewers: '8.9K Views',
    ),
    TvChannel(
      id: 'agri_3',
      title: 'Dairy Farming & Cow Nutrition',
      tamilTitle: 'கறவை மாடு வளர்ப்பு & தீவன மேலாண்மை',
      category: 'Animal Husbandry',
      description: 'Hydroponic green fodder production and A2 milk yield optimization techniques.',
      videoUrl: 'https://www.youtube.com/watch?v=demo_dairy_farm',
      icon: LucideIcons.milk,
      viewers: '19.5K Views',
    ),
  ];

  final List<TvChannel> _devotional = const [
    TvChannel(
      id: 'devo_1',
      title: 'Thiruvannamalai Deepam Live Stream',
      tamilTitle: 'திருவண்ணாமலை தீபம் நேரலை',
      category: 'Live Darshan',
      description: 'Arulmigu Arunachaleswarar Temple sanctum sanctorum live Abhishek and Aarti darshan.',
      videoUrl: 'https://www.youtube.com/watch?v=live_arunachala',
      icon: LucideIcons.flame,
      isLive: true,
      viewers: '5.8K Watching',
    ),
    TvChannel(
      id: 'devo_2',
      title: 'Madurai Meenakshi Amman Suprabatham',
      tamilTitle: 'மதுரை மீனாட்சி சுப்ரபாதம்',
      category: 'Temple Chants',
      description: 'Daily divine morning prayers, Vedic chanting, and temple bell chimes.',
      videoUrl: 'https://www.youtube.com/watch?v=live_meenakshi',
      icon: LucideIcons.sun,
      viewers: '22.1K Views',
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

  void _watchStream(TvChannel channel) async {
    final uri = Uri.parse(channel.videoUrl);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Playing ${channel.title}...')),
        );
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
            Icon(LucideIcons.tv, color: Color(0xFFEC4899), size: 24),
            SizedBox(width: 10),
            Text('TvO Media & Live', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFEC4899),
          labelColor: const Color(0xFFEC4899),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(text: '📡 Live News'),
            Tab(text: '🌾 Uzhavan Agri TV'),
            Tab(text: '🕉️ Devotional'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildChannelList(_liveNews),
          _buildChannelList(_agriChannels),
          _buildChannelList(_devotional),
        ],
      ),
    );
  }

  Widget _buildChannelList(List<TvChannel> channels) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: channels.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final ch = channels[index];
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
                      color: const Color(0x26EC4899),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(ch.icon, color: const Color(0xFFEC4899), size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (ch.isLive)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEF4444),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(LucideIcons.radio, color: Colors.white, size: 10),
                                    SizedBox(width: 4),
                                    Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0x26EC4899),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(ch.category, style: const TextStyle(color: Color(0xFFEC4899), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            Text(ch.viewers, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(ch.title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(ch.tamilTitle, style: const TextStyle(color: Color(0xFFEC4899), fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(ch.description, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _watchStream(ch),
                  icon: const Icon(LucideIcons.playCircle, size: 16),
                  label: Text(ch.isLive ? 'Watch Live Broadcast' : 'Play Video Lesson'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEC4899),
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
