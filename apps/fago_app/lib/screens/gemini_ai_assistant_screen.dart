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
  
  bool _isConnected = false;
  bool _isLoading = false;
  bool _isGenerating = false;
  String _activeApiKey = '';
  String _selectedMode = 'Agri'; // Agri, Tutor, Business, General
  String _aiResponse = '';

  @override
  void initState() {
    super.initState();
    _loadSavedGeminiKey();
  }

  Future<void> _loadSavedGeminiKey() async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    String? savedKey = prefs.getString('user_gemini_api_key');

    // Fallback: Check if key is available in user metadata
    if (savedKey == null || savedKey.isEmpty) {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null && user.userMetadata != null && user.userMetadata!['gemini_api_key'] != null) {
        savedKey = user.userMetadata!['gemini_api_key'].toString();
      }
    }

    if (savedKey != null && savedKey.isNotEmpty) {
      setState(() {
        _activeApiKey = savedKey!;
        _apiKeyController.text = savedKey;
        _isConnected = true;
      });
    }
    setState(() => _isLoading = false);
  }

  Future<void> _saveGeminiKey(String key) async {
    final cleanKey = key.trim();
    if (cleanKey.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid Google Gemini API Key')),
      );
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_gemini_api_key', cleanKey);

    setState(() {
      _activeApiKey = cleanKey;
      _isConnected = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Google Gemini AI Connected Successfully!')),
    );
  }

  Future<void> _openGoogleAiStudio() async {
    final uri = Uri.parse('https://aistudio.google.com/app/apikey');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
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

    if (_activeApiKey.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('தயவுசெய்து Gemini API Key-ஐ இணைக்கவும்')),
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

    try {
      final endpoint = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$_activeApiKey',
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
        final String text = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? 'பதில் பெறப்படவில்லை.';
        setState(() => _aiResponse = text);
      } else {
        final errData = jsonDecode(response.body);
        final errMsg = errData['error']?['message'] ?? 'API Error ${response.statusCode}';
        setState(() => _aiResponse = '❌ Error: $errMsg\n\nCheck your Gemini API Key or try again.');
      }
    } catch (e) {
      setState(() => _aiResponse = '❌ Connection Error: $e');
    } finally {
      setState(() => _isGenerating = false);
    }
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.greenAccent))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Gemini Key Status Banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _isConnected
                            ? [const Color(0xFF059669), const Color(0xFF10B981)]
                            : [const Color(0xFFD97706), const Color(0xFFF59E0B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Text(_isConnected ? '🤖' : '🔑', style: const TextStyle(fontSize: 32)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _isConnected ? 'Google Gemini AI Connected' : 'Connect Free Google Gemini AI',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  Text(
                                    _isConnected ? 'Gemini 1.5 Flash Active • 100% Free Unlimited Usage' : 'Get free API key in 1-tap from Google AI Studio',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _openGoogleAiStudio,
                                icon: const Icon(Icons.open_in_new, size: 16),
                                label: const Text('Auto-Get Key (Google AI Studio)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.black80,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Key Input Field
                  if (!_isConnected) ...[
                    TextField(
                      controller: _apiKeyController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Paste Google Gemini API Key (AIzaSy...)',
                        labelStyle: const TextStyle(color: Colors.greenAccent),
                        prefixIcon: const Icon(Icons.key, color: Colors.greenAccent),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.greenAccent.withValues(alpha: 0.5)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Colors.greenAccent, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => _saveGeminiKey(_apiKeyController.text),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.greenAccent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Save & Connect Gemini AI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // AI Mode Selector Tabs
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('🌾 பயிர் மருத்துவர் (Agri)'),
                          selected: _selectedMode == 'Agri',
                          onSelected: (val) => setState(() => _selectedMode = 'Agri'),
                          selectedColor: Colors.greenAccent,
                          labelStyle: TextStyle(color: _selectedMode == 'Agri' ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('📚 AI ஆசான் (Tutor)'),
                          selected: _selectedMode == 'Tutor',
                          onSelected: (val) => setState(() => _selectedMode = 'Tutor'),
                          selectedColor: Colors.purpleAccent,
                          labelStyle: TextStyle(color: _selectedMode == 'Tutor' ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Prompt Input Box
                  TextField(
                    controller: _promptController,
                    maxLines: 3,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: _selectedMode == 'Agri'
                          ? 'கேள்வி கேளுங்கள் (எ.கா: தக்காளி இலையில் மஞ்சள் புள்ளி வந்தால் என்ன செய்வது?)'
                          : 'கேள்வி கேளுங்கள் (எ.கா: TNPSC குரூப் 4 தேர்வுக்கான தமிழ் இலக்கணக் குறிப்புகள்)',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
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
                        border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.4)),
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
