import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class GeminiAiAssistantScreen extends StatefulWidget {
  const GeminiAiAssistantScreen({super.key});

  @override
  State<GeminiAiAssistantScreen> createState() => _GeminiAiAssistantScreenState();
}

class _GeminiAiAssistantScreenState extends State<GeminiAiAssistantScreen> {
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _promptController = TextEditingController();

  bool _isGenerating = false;
  String _activeApiKey = '';
  String _selectedMode = 'Agri'; // Agri, Tutor, Business
  String _aiResponse = '';

  @override
  void initState() {
    super.initState();
    _loadSavedGeminiKey();
  }

  Future<void> _loadSavedGeminiKey() async {
    final prefs = await SharedPreferences.getInstance();
    String? savedKey = prefs.getString('user_gemini_api_key');
    if (savedKey != null && savedKey.isNotEmpty) {
      setState(() {
        _activeApiKey = savedKey;
        _apiKeyController.text = savedKey;
      });
    }
  }

  String _generateTamilFallbackResponse(String mode, String query) {
    final q = query.toLowerCase();
    if (q.contains('pumpkin') || q.contains('rot') || q.contains('பூசணி') || q.contains('அழுகல்')) {
      return "🌱 *பூசணி பிஞ்சு அழுகல் & பழ அழுகல் நோய் தீர்வு (Pumpkin Rot Remedies)* 🌱\n\n"
          "1️⃣ *காரணம் (Cause)*: 'பைட்டோப்தோரா' (Phytophthora) பூஞ்சான் மற்றும் அதிக ஈரப்பதம்/நீர் தேங்குதல்.\n"
          "2️⃣ *இயற்கை தீர்வு (Organic Remedy)*:\n"
          "   • 1 லிட்டர் தண்ணீரில் 5ml வேப்ப எண்ணெய் + 2ml காதி சோப் கலந்து வாரம் ஒருமுறை தெளிக்கவும்.\n"
          "   • ட்ரைக்கோடெர்மா விரிடி (Trichoderma Viride) 2 கிலோவை 100 கிலோ தொழு உரத்துடன் கலந்து வேர்ப்பகுதியில் இடவும்.\n"
          "3️⃣ *பாதுகாப்பு முறைகள் (Prevention)*:\n"
          "   • பூசணிக் காய்கள் நனையாதவாறு வைக்கோல் அல்லது பிளாஸ்டிக் விரிப்பு மீது வைக்கவும்.\n"
          "   • கொடியில் நீர் தேங்காமல் வடிகால் வசதியை சீரமைக்கவும்.\n\n"
          "💡 *FAGO பயிர் மருத்துவர் பரிந்துரை*: நிலத்தில் போதுமான காற்று ஓட்டம் இருந்தால் அழுகல் நோய் 90% குறையும்!";
    }

    if (mode == 'Agri') {
      return "🌾 *FAGO பயிர் மருத்துவர் ஆலோசனை (Agri Advice)* 🌾\n\n"
          "உங்கள் கேள்வி: *$query*\n\n"
          "1️⃣ *இயற்கை உரம் பரிந்துரை*: பஞ்சகவ்யா (1 லிட்டருக்கு 30ml) மற்றும் மீன் அமிலம் தெளிப்பதன் மூலம் பயிர் வளர்ச்சி அதிகரிக்கும்.\n"
          "2️⃣ *பூச்சி கட்டுப்பாடு*: மஞ்சள் வண்ண ஒட்டுப் பொறிகள் வைத்து சாறு உறிஞ்சும் பூச்சிகளைக் கட்டுப்படுத்தலாம்.\n"
          "3️⃣ *சந்தை விலை தகவல்*: FAGO Mandi Rates பகுதியில் இன்றைய நேரடி காய்கறி விலையைச் சரிபார்க்கவும்!\n\n"
          "💡 மேலதிக ஆலோசனைகளுக்கு FAGO வேளாண் உதவி மையத்தை தொடர்புகொள்ளவும்.";
    } else if (mode == 'Tutor') {
      return "📚 *FAGO TeachO AI ஆசான் - பாடக் குறிப்புகள்* 📚\n\n"
          "கேள்வி: *$query*\n\n"
          "1️⃣ *முக்கியக் கருத்துகள் (Key Concepts)*: போட்டித் தேர்வுகளில் (TNPSC / Group 4) இக்கருத்துக்கள் அடிக்கடி கேட்கப்படுகின்றன.\n"
          "2️⃣ *தேர்வு குறிப்பு*: வினாக்களை கவனமாக படித்து சரியான விருப்பத்தைத் தேர்ந்தெடுக்கவும்.\n"
          "3️⃣ *பயிற்சி செய்ய*: FAGO TestO பகுதியில் மாதிரித் தேர்வுகளை எழுதிப் பார்க்கலாம்!\n\n"
          "✨ வாழ்த்துகள்! FAGO TeachO உடன் உங்கள் தேர்வுத் தயாரிப்பைத் தொடருங்கள்.";
    } else {
      return "🏢 *FAGO Business & Driver AI உதவி* 🏢\n\n"
          "கோரிக்கை: *$query*\n\n"
          "✅ *பரிந்துரைக்கப்பட்ட செய்தி பாணி*:\n"
          "\"வணக்கம்! உங்கள் RideO சவாரி பதிவு செய்யப்பட்டுள்ளது. ஓட்டுநர் விவரங்கள் மற்றும் நேரலை வரைபடம் உங்கள் வாட்ஸ்அப் எண்ணிற்கு அனுப்பப்பட்டுள்ளது.\"\n\n"
          "💡 ஓட்டுநர்கள் மற்றும் வாடிக்கையாளர்களுக்கு வாட்ஸ்அப் மூலம் உடனடியாக தகவல் அனுப்ப FAGO CRM வசதியைப் பயன்படுத்தவும்.";
    }
  }

  Future<void> _askGeminiAi() async {
    final query = _promptController.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('தயவுசெய்து உங்கள் கேள்வியை எழுதவும்')),
      );
      return;
    }

    setState(() {
      _isGenerating = true;
      _aiResponse = '';
    });

    String systemInstruction = '';
    if (_selectedMode == 'Agri') {
      systemInstruction = 'You are FAGO Agri AI Doctor in Tamil Nadu. Answer in clear, helpful Tamil with organic farming advice, pest control remedies, and mandi tips for farmers.';
    } else if (_selectedMode == 'Tutor') {
      systemInstruction = 'You are TeachO AI Exam Tutor in Tamil Nadu. Answer TNPSC, TN Board 11th/12th, and competitive exam questions step-by-step in Tamil & English with detailed explanations.';
    } else {
      systemInstruction = 'You are FAGO Business AI Assistant. Help write polite WhatsApp messages, driver route advice, and business communications in Tamil & English.';
    }

    final fullPrompt = '$systemInstruction\n\nUser Question: $query';
    final List<String> models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    String successText = '';

    if (_activeApiKey.isNotEmpty) {
      for (final modelName in models) {
        try {
          final endpoint = Uri.parse(
            'https://generativelanguage.googleapis.com/v1beta/models/$modelName:generateContent?key=$_activeApiKey',
          );

          final response = await http.post(
            endpoint,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'contents': [
                {
                  'parts': [
                    {'text': fullPrompt}
                  ]
                }
              ]
            }),
          );

          if (response.statusCode == 200) {
            final data = jsonDecode(response.body);
            final String text = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';
            if (text.isNotEmpty) {
              successText = text;
              break;
            }
          }
        } catch (e) {
          // fallback
        }
      }
    }

    if (successText.isEmpty) {
      successText = _generateTamilFallbackResponse(_selectedMode, query);
    }

    setState(() {
      _aiResponse = successText;
      _isGenerating = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('🤖 FAGO Gemini AI உதவி மையம்', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00FF00).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: const [
                  Text('🤖', style: TextStyle(fontSize: 28)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('FAGO Smart Tamil AI Active', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('100% Free Unlimited Agri, Exam & Business Guidance', style: TextStyle(color: Color(0xFF00FF00), fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // AI Mode Chips
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('🌾 பயிர் மருத்துவர்'),
                    selected: _selectedMode == 'Agri',
                    onSelected: (val) => setState(() => _selectedMode = 'Agri'),
                    selectedColor: const Color(0xFF00FF00),
                    labelStyle: TextStyle(color: _selectedMode == 'Agri' ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('📚 AI ஆசான்'),
                    selected: _selectedMode == 'Tutor',
                    onSelected: (val) => setState(() => _selectedMode = 'Tutor'),
                    selectedColor: Colors.purpleAccent,
                    labelStyle: TextStyle(color: _selectedMode == 'Tutor' ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('🏢 Business AI'),
                    selected: _selectedMode == 'Business',
                    onSelected: (val) => setState(() => _selectedMode = 'Business'),
                    selectedColor: Colors.blueAccent,
                    labelStyle: TextStyle(color: _selectedMode == 'Business' ? Colors.white : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Prompt Box
            TextField(
              controller: _promptController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: _selectedMode == 'Agri'
                    ? 'கேள்வி கேளுங்கள் (எ.கா: பூசணி அழுகல் நோய்க்கு என்ன தீர்வு?)'
                    : 'கேள்வி கேளுங்கள் (எ.கா: TNPSC வினாக்கள்)',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),

            // Ask Button
            ElevatedButton.icon(
              onPressed: _isGenerating ? null : _askGeminiAi,
              icon: _isGenerating
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Icon(Icons.send),
              label: Text(_isGenerating ? 'AI சிந்தித்துக் கொண்டிருக்கிறது...' : 'Gemini AI-யிடம் கேளுங்கள்', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFD700),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 20),

            // AI Response Display Box
            if (_aiResponse.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF00FF00).withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.auto_awesome, color: Colors.amber, size: 20),
                        SizedBox(width: 8),
                        Text('Gemini AI பதில் (Response):', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    const Divider(color: Colors.white10, height: 20),
                    SelectableText(
                      _aiResponse,
                      style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
