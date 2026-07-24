import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class WhatsappStatusPromoScreen extends StatefulWidget {
  const WhatsappStatusPromoScreen({super.key});

  @override
  State<WhatsappStatusPromoScreen> createState() => _WhatsappStatusPromoScreenState();
}

class _WhatsappStatusPromoScreenState extends State<WhatsappStatusPromoScreen> {
  String _selectedCategory = 'rideo';

  final Map<String, Map<String, String>> _templates = {
    'rideo': {
      'title': '🚖 RideO / DriveO (0% Commission)',
      'icon': '🚖',
      'tamilText': '☀️ *ஃபேகோ சூப்பர் ஆப் - 0% கமிஷன் சவாரி!* ☀️\n\n'
          '🚖 உங்கள் ஊரில் பைக், ஆட்டோ & கார் சவாரி முன்பதிவு செய்ய எந்த கமிஷனும் இல்லை!\n'
          '🚚 டிரைவர் நண்பர்கள் 100% வருமானத்தை நேரடியாக பெறலாம்.\n\n'
          '👉 உடனே இலவசமாக பயன்படுத்தி பாருங்கள்:\n'
          '🔗 https://watscrm.vercel.app\n\n'
          '#FAGO #RideO #ZeroCommission #TamilNadu',
    },
    'rento': {
      'title': '🚜 RentO (விவசாய இயந்திர வாடகை)',
      'icon': '🚜',
      'tamilText': '🌾 *ஃபேகோ ரெண்டோ - விவசாய வாடகை சேவை!* 🌾\n\n'
          '🚜 டிராக்டர், ஹார்வெஸ்டர், ஜேசிபி & விவசாய கருவிகள் உங்கள் ஊரில் நேரடி வாடகைக்கு!\n'
          'தரமான இயந்திரங்கள் குறைந்த வாடகையில் கிடைக்கின்றன.\n\n'
          '👉 தொடர்புக்கு செயலி பதிவிறக்கம் செய்ய:\n'
          '🔗 https://watscrm.vercel.app\n\n'
          '#RentO #AgriRentals #TamilNaduFarmers',
    },
    'mandi': {
      'title': '🌾 உழவர் சந்தை (Mandi Crop Prices)',
      'icon': '🌾',
      'tamilText': '🥦 *இன்றைய காய்கறி & நெல் சந்தை விலை நிலவரம்!* 🥦\n\n'
          '📊 தமிழ்நாட்டின் அனைத்து மாவட்ட உழவர் சந்தை காய்கறி & விவசாய பொருட்கள் நேரடி விலை நிலவரம் உடனுக்குடன்!\n\n'
          '👉 இன்றைய விலையை சரிபார்க்க:\n'
          '🔗 https://watscrm.vercel.app\n\n'
          '#MandiPrices #UzhavarSanthai #TamilNaduAgri',
    },
    'dealo': {
      'title': '🏷️ DealO (5km Hyperlocal Marketplace)',
      'icon': '🏷️',
      'tamilText': '🛍️ *உங்கள் ஊரில் 5 கி.மீ சுற்றளவில் சூப்பர் டீல்கள்!* 🛍️\n\n'
          '🏷️ பழைய & புதிய பொருட்கள், மொபைல், வண்டி, லேப்டாப் நேரடியாக வாங்க/விற்க!\n'
          'இடைத்தரகர் இல்லாமல் நேரடியாக வாடிக்கையாளர்களை தொடர்பு கொள்ளுங்கள்.\n\n'
          '👉 டீல்களை பார்க்க:\n'
          '🔗 https://watscrm.vercel.app\n\n'
          '#DealO #LocalDeals #TamilNaduMarket',
    },
    'teacho': {
      'title': '🎓 TeachO / TestO (TNPSC & Govt Exam Prep)',
      'icon': '🎓',
      'tamilText': '📚 *டிஎன்பிஎஸ்சி & அரசு தேர்வு இலவச ஆன்லைன் பயிற்சி!* 📚\n\n'
          '✍️ TNPSC Group 1, 2, 4, VAO, SSC & Police தேர்வுகளுக்கு இலவச ஆன்லைன் மாதிரி தேர்வுகள்!\n'
          'தினசரி பாடங்கள் & வினாக்கள் தமிழில்.\n\n'
          '👉 இலவச ஆன்லைன் தேர்வு எழுத:\n'
          '🔗 https://thamizhan.vercel.app\n\n'
          '#TeachO #TestO #TNPSC #TamilNaduEducation',
    },
  };

  void _shareToWhatsappStatus(String text) async {
    final user = Supabase.instance.client.auth.currentUser;
    final phone = user?.phone ?? user?.userMetadata?['phone']?.toString() ?? 'User';
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');

    // Append user referral param if phone exists
    String finalPromoText = text;
    if (cleanPhone.isNotEmpty) {
      finalPromoText += "\n\n📲 *Referral User:* +91 $cleanPhone";
    }

    final encoded = Uri.encodeComponent(finalPromoText);
    final url = Uri.parse("https://api.whatsapp.com/send?text=$encoded");

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch WhatsApp. Please make sure WhatsApp is installed.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentObj = _templates[_selectedCategory]!;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: const Text('📸 Share to WhatsApp Status', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF141414),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF25D366), Color(0xFF128C7E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [BoxShadow(color: Color(0xFF25D366), blurRadius: 10, spreadRadius: -5)],
              ),
              child: Row(
                children: const [
                  Icon(Icons.amp_stories, color: Colors.white, size: 36),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "தமிழ்நாடு வாட்ஸ்அப் விளம்பரம்",
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "1-Tap Share to WhatsApp Status! Promote local services & earn referral points.",
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              "Select Promo Category (பிரிவை தேர்ந்தெடுக்கவும்):",
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 12),

            // Category Chips Selector
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _templates.keys.map((key) {
                  final isSelected = _selectedCategory == key;
                  final item = _templates[key]!;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text("${item['icon']} ${item['title']!.split(' ')[1]}"),
                      selected: isSelected,
                      selectedColor: const Color(0xFF00FF00),
                      labelStyle: TextStyle(color: isSelected ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      onSelected: (val) {
                        if (val) setState(() => _selectedCategory = key);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),

            // Template Preview Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.4), width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        currentObj['title']!,
                        style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const Icon(Icons.preview, color: Colors.grey, size: 18),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 20),
                  SelectableText(
                    currentObj['tamilText']!,
                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Share to WhatsApp Status Button
            ElevatedButton.icon(
              onPressed: () => _shareToWhatsappStatus(currentObj['tamilText']!),
              icon: const Icon(Icons.share, color: Colors.black),
              label: const Text(
                '📲 Post to My WhatsApp Status (வாட்ஸ்அப்பில் பகிரவும்)',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
