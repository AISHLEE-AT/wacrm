// ignore_for_file: use_build_context_synchronously
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';
import 'dart:io';

import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/gemini_service.dart';
import '../services/history_service.dart';
import '../../../core/env.dart';

// ─── CATEGORIES ───
class _Category {
  final String id, name, tamil;
  final IconData icon;
  final List<String> tools;
  const _Category({required this.id, required this.name, required this.tamil, required this.icon, required this.tools});
}

const _categories = [
  _Category(id: 'summarize', name: 'Summarize AI', tamil: 'சுருக்கம் AI', icon: LucideIcons.fileText, tools: ['Text Summarizer', 'YouTube Summarizer', 'Webpage Summarizer']),
  _Category(id: 'agri', name: 'Agri & Rural', tamil: 'வேளாண்மை & கிராமம்', icon: LucideIcons.globe, tools: ['Crop Disease Analysis', 'Farming Insights']),
  _Category(id: 'govt', name: 'Govt & Citizen', tamil: 'அரசு & இ-சேவை', icon: LucideIcons.fileSignature, tools: ['TN E-Sevai Chat', 'Legal Translator']),
  _Category(id: 'education', name: 'Education', tamil: 'கல்வி & தேர்வு', icon: LucideIcons.search, tools: ['Quiz Creator', 'Notes Maker']),
  _Category(id: 'work', name: 'Work & Content', tamil: 'வேலை & கடிதங்கள்', icon: LucideIcons.bot, tools: ['Email Crafter', 'Social Media Gen', 'Resume Improver']),
  _Category(id: 'viral', name: 'Viral & Social', tamil: 'வாட்ஸ்அப் ஸ்டேட்டஸ்', icon: LucideIcons.share2, tools: ['StatusO Quote Gen']),
];

// ─── VOICE PRESETS ───
class _VoicePreset {
  final String category, tamil, english, tool, iconEmoji;
  const _VoicePreset({required this.category, required this.tamil, required this.english, required this.tool, required this.iconEmoji});
}

const _voicePresets = [
  _VoicePreset(category: 'agri', tamil: 'தக்காளி இலை கருகுகிறது, என்ன மருந்து அடிக்கலாம்?', english: 'Tomato leaves are turning yellow with black spots. What medicine to spray?', tool: 'Crop Disease Analysis', iconEmoji: '🌾'),
  _VoicePreset(category: 'govt', tamil: 'வருமான சான்றிதழ் பெற என்னென்ன ஆவணங்கள் தேவை?', english: 'What documents are required to apply for an Income Certificate in Tamil Nadu?', tool: 'TN E-Sevai Chat', iconEmoji: '🏛️'),
  _VoicePreset(category: 'govt', tamil: 'கலைஞர் மகளிர் உரிமை தொகை ₹1000 தகுதி மற்றும் விண்ணப்பிப்பது எப்படி?', english: 'How to apply for Kalaignar Magalir Urimai Thogai Rs 1000 scheme?', tool: 'TN E-Sevai Chat', iconEmoji: '💰'),
  _VoicePreset(category: 'education', tamil: '10-ஆம் வகுப்பு அறிவியல் பாடத்திற்கு 5 மாதிரி வினாடி வினா தயார் செய்', english: 'Create a 5-question science mock quiz for 10th standard', tool: 'Quiz Creator', iconEmoji: '🎓'),
  _VoicePreset(category: 'work', tamil: 'மருத்துவ விடுப்புக்காக மேலாளருக்கு ஒரு முறையான கடிதம் எழுது', english: 'Draft a formal sick leave email to my manager for 2 days', tool: 'Email Crafter', iconEmoji: '✉️'),
  _VoicePreset(category: 'agri', tamil: 'நெல் பயிரில் குருத்துப்பூச்சி தாக்குதலை கட்டுப்படுத்துவது எப்படி?', english: 'How to control stem borer pest in paddy crop organically?', tool: 'Farming Insights', iconEmoji: '🌾'),
];

// ─── TOOL CONFIGS ───
class _ToolConfig {
  final String labelEn, labelTa, placeholderEn, placeholderTa, buttonEn, buttonTa, resultTitleEn, resultTitleTa;
  final List<String> chipsEn, chipsTa;
  const _ToolConfig({required this.labelEn, required this.labelTa, required this.placeholderEn, required this.placeholderTa, required this.buttonEn, required this.buttonTa, required this.resultTitleEn, required this.resultTitleTa, required this.chipsEn, required this.chipsTa});
}

const Map<String, _ToolConfig> _toolConfigs = {
  'Text Summarizer': _ToolConfig(labelEn: '📄 Paste Text, Paragraph, or Article to Summarize:', labelTa: '📄 சுருக்க வேண்டிய உரை அல்லது கட்டுரையை உள்ளிடவும்:', placeholderEn: 'Paste long news, research notes, or contract text here...', placeholderTa: 'நீண்ட செய்திகள், குறிப்புகள் அல்லது ஆவண உரையை இங்கே ஒட்டவும்...', buttonEn: 'Generate Bullet-Point Summary', buttonTa: 'முக்கிய குறிப்புகளாக சுருக்குக', resultTitleEn: 'Executive Summary & Key Takeaways', resultTitleTa: 'முக்கிய சுருக்கக் குறிப்புகள்', chipsEn: ['Summarize in 3 bullet points', 'Extract action items', 'Explain like I am 10'], chipsTa: ['3 முக்கிய குறிப்புகளாக சுருக்கு', 'செயல் திட்டங்களை பிரித்து கொடு', 'எளிய தமிழில் விளக்கு']),
  'YouTube Summarizer': _ToolConfig(labelEn: '🎥 Enter YouTube Video Link or Topic:', labelTa: '🎥 யூடியூப் வீடியோ இணைப்பு (Link) அல்லது தலைப்பு:', placeholderEn: 'https://youtube.com/watch?v=... or Video title...', placeholderTa: 'https://youtube.com/watch?v=... அல்லது வீடியோ தலைப்பு...', buttonEn: 'Summarize YouTube Video', buttonTa: 'வீடியோவை சுருக்கி தருக', resultTitleEn: 'Video Breakdown & Timestamp Summary', resultTitleTa: 'வீடியோ முழு சுருக்கம்', chipsEn: ['Agriculture farming tech video', 'Budget 2026 economic highlights', 'TNPSC history lecture'], chipsTa: ['விவசாய தொழில்நுட்ப வீடியோ', 'பட்ஜெட் முக்கிய அம்சங்கள்', 'TNPSC வரலாறு பாடம்']),
  'Webpage Summarizer': _ToolConfig(labelEn: '🌐 Enter Article / Webpage URL:', labelTa: '🌐 இணையதள பக்கம் அல்லது செய்தி முகவரி (URL):', placeholderEn: 'https://example.com/article...', placeholderTa: 'https://example.com/article...', buttonEn: 'Extract & Summarize Webpage', buttonTa: 'இணையப் பக்கத்தை சுருக்குக', resultTitleEn: 'Webpage Insights & Core Facts', resultTitleTa: 'இணையதள செய்தி சுருக்கம்', chipsEn: ['Tamil Nadu govt gazette link', 'Daily agri market report', 'Tech news article'], chipsTa: ['தமிழக அரசு செய்திக்குறிப்பு', 'தினசரி சந்தை விலை நிலவரம்', 'தொழில்நுட்ப செய்தி']),
  'Crop Disease Analysis': _ToolConfig(labelEn: '🌾 Crop Name & Visible Disease Symptoms (Attach Photo):', labelTa: '🌾 பயிர் பெயர் & நோய் அறிகுறிகள் (புகைப்படம் இணைக்கவும்):', placeholderEn: 'e.g. Paddy stem borer, tomato leaf curling...', placeholderTa: 'எ.கா: தக்காளி இலை சுருட்டல் மற்றும் இலைக்கருகல் நோய்...', buttonEn: 'Diagnose Crop Disease & Cure', buttonTa: 'பயிர் நோய் கண்டறிந்து மருந்து பரிந்துரை', resultTitleEn: 'Crop Health Prescription & Organic Remedy', resultTitleTa: 'பயிர் பாதுகாப்பு பரிந்துரை & மருந்து முறை', chipsEn: ['Tomato yellow leaf curl virus', 'Paddy stem borer remedy', 'Banana root rot control'], chipsTa: ['தக்காளி இலை சுருட்டல் மருந்து', 'நெல் குருத்துப்பூச்சி கட்டுப்பாடு', 'வாழை வேர் அழுகல் தீர்வு']),
  'Farming Insights': _ToolConfig(labelEn: '🌱 Farming Technique, Soil Type or Crop Guidance:', labelTa: '🌱 சாகுபடி முறை, மண் வகை அல்லது பயிர் ஆலோசனை:', placeholderEn: 'e.g. Drip irrigation organic yield tips for sugarcane...', placeholderTa: 'எ.கா: சொட்டுநீர் பாசனத்தில் கரும்பு மகசூல் வழிகள்...', buttonEn: 'Fetch High-Yield Agri Insights', buttonTa: 'சாகுபடி ஆலோசனைகளைப் பெறுக', resultTitleEn: 'Agricultural Advisory & Best Practices', resultTitleTa: 'விவசாய மகசூல் & மேலாண்மை வழிகாட்டி', chipsEn: ['Organic fertilizer dosage', 'Soil testing benefits', 'Intercropping with coconut'], chipsTa: ['இயற்கை உரமிடும் அளவு', 'மண் பரிசோதனை முறைகள்', 'தென்னையில் ஊடுபயிர் சாகுபடி']),
  'TN E-Sevai Chat': _ToolConfig(labelEn: '🏛️ Government Certificate / Scheme Inquiry:', labelTa: '🏛️ அரசு சான்றிதழ் / நலத்திட்ட விவரங்களை கேட்கவும்:', placeholderEn: 'e.g. Documents required for Patta Chitta transfer...', placeholderTa: 'எ.கா: பட்டா சிட்டா பெயர் மாற்றம் செய்ய தேவையான ஆவணங்கள்?...', buttonEn: 'Get E-Sevai & Scheme Steps', buttonTa: 'இ-சேவை விண்ணப்ப வழிமுறைகள் பெறுக', resultTitleEn: 'Government Service Application Guide', resultTitleTa: 'அரசு சேவை விண்ணப்ப வழிகாட்டி', chipsEn: ['Patta Chitta online apply', 'Income certificate documents', 'Kalaignar Magalir Urimai Thogai'], chipsTa: ['பட்டா பெயர் மாற்றம் முறை', 'வருமான சான்றிதழ் ஆவணங்கள்', 'கலைஞர் மகளிர் உரிமை தொகை ₹1000']),
  'Legal Translator': _ToolConfig(labelEn: '⚖️ Legal Document / Land Agreement to Translate:', labelTa: '⚖️ மொழிபெயர்க்க வேண்டிய சட்ட / பத்திர ஆவணம்:', placeholderEn: 'e.g. Lease agreement or rental deed clauses...', placeholderTa: 'எ.கா: நில குத்தகை பத்திரம் அல்லது வாடகை ஒப்பந்த வாசகங்கள்...', buttonEn: 'Translate & Simplify Legal Terms', buttonTa: 'சட்ட ஆவணத்தை மொழிபெயர்க்க', resultTitleEn: 'Certified Bilingual Legal Translation', resultTitleTa: 'தெளிவான சட்ட மொழிபெயர்ப்பு & விளக்கம்', chipsEn: ['Rental agreement deed', 'Land sale agreement clause', 'Power of attorney terms'], chipsTa: ['வாடகை ஒப்பந்த பத்திரம்', 'நில விற்பனை ஒப்பந்த வாசகம்', 'பொது அதிகார பத்திரம்']),
  'Quiz Creator': _ToolConfig(labelEn: '🎓 Subject, Standard / Exam & Topic for Mock Quiz:', labelTa: '🎓 வினாடி வினாவுக்கான பாடம், வகுப்பு & தலைப்பு:', placeholderEn: 'e.g. 10th Standard Science Physics Electricity or TNPSC Group 4 History...', placeholderTa: 'எ.கா: 10-ஆம் வகுப்பு அறிவியல் மின்சாரம் அல்லது TNPSC வரலாறு...', buttonEn: 'Generate Interactive Mock Quiz', buttonTa: 'மாதிரி வினாடி வினா உருவாக்குக', resultTitleEn: 'Exam-Ready MCQs with Answer Key', resultTitleTa: 'வினா விடை & விரிவான விளக்கங்கள்', chipsEn: ['TNPSC Group 4 Tamil literature', '10th Maths algebra formulas', '12th Biology genetics'], chipsTa: ['TNPSC தமிழ் இலக்கியம்', '10-ஆம் வகுப்பு கணிதம் சூத்திரங்கள்', '12-ஆம் வகுப்பு உயிரியல் மரபியல்']),
  'Notes Maker': _ToolConfig(labelEn: '📚 Topic or Lesson to Generate Revision Notes:', labelTa: '📚 திருப்புதல் குறிப்புகள் தேவைப்படும் பாடம் / தலைப்பு:', placeholderEn: 'e.g. Photosynthesis chapter with diagram notes & formulas...', placeholderTa: 'எ.கா: ஒளிச்சேர்க்கை பாடம் சுருக்கக் குறிப்புகள்...', buttonEn: 'Generate Study Revision Notes', buttonTa: 'படிப்பு குறிப்புகள் உருவாக்குக', resultTitleEn: 'Structured Study Material & Cheat-Sheet', resultTitleTa: 'எளிதான படிப்பு குறிப்புகள் & நினைவூட்டல்', chipsEn: ['Important formulas cheat sheet', '2-mark questions & answers', 'Flowchart study notes'], chipsTa: ['முக்கிய சூத்திரங்கள் அட்டவணை', '2 மதிப்பெண் வினா விடைகள்', 'கருத்து வரைபடக் குறிப்புகள்']),
  'Email Crafter': _ToolConfig(labelEn: '✉️ Purpose & Recipient for Formal Email / Letter:', labelTa: '✉️ கடிதம் / மின்னஞ்சல் நோக்கம் மற்றும் பெறுநர் விவரம்:', placeholderEn: 'e.g. Formal leave letter to school principal for 3 days due to fever...', placeholderTa: 'எ.கா: உடல்நலக்குறைவு காரணமாக 3 நாட்கள் விடுப்பு கோரி மேலாளருக்கு கடிதம்...', buttonEn: 'Draft Professional Letter / Email', buttonTa: 'முறையான கடிதம் / மின்னஞ்சல் எழுதுக', resultTitleEn: 'Professional Email / Letter Draft', resultTitleTa: 'முறையான கடித வரைவு', chipsEn: ['Sick leave to manager for 2 days', 'Job application cover letter', 'Bank loan request letter'], chipsTa: ['2 நாள் மருத்துவ விடுப்பு கடிதம்', 'வேலை விண்ணப்ப முகப்புக் கடிதம்', 'வங்கி கடன் கோரிக்கை கடிதம்']),
  'Social Media Gen': _ToolConfig(labelEn: '📢 Product, Business Offer or Campaign Details:', labelTa: '📢 விளம்பரம் செய்ய வேண்டிய தொழில், சலுகை அல்லது பொருள் விவரம்:', placeholderEn: 'e.g. 20% festive discount on organic cold-pressed sesame oil...', placeholderTa: 'எ.கா: இயற்கை நல்லெண்ணெய் 20% பொங்கல் சலுகை வாட்ஸ்அப் விளம்பரம்...', buttonEn: 'Generate Viral Marketing Posts', buttonTa: 'ஈர்க்கும் விளம்பரப் பதிவுகளை உருவாக்குக', resultTitleEn: 'Social Media & WhatsApp Ad Copy', resultTitleTa: 'சமூக வலைதள விளம்பர வாசகங்கள்', chipsEn: ['WhatsApp business offer broadcast', 'Instagram viral reel caption', 'Festival discount greeting'], chipsTa: ['வாட்ஸ்அப் தொழில் சலுகை செய்தி', 'இன்ஸ்டாகிராம் ரீல்ஸ் வாசகம்', 'பண்டிகை கால தள்ளுபடி பதிவு']),
  'Resume Improver': _ToolConfig(labelEn: '💼 Career Role, Experience & Skill Details:', labelTa: '💼 உங்கள் தொழில் தகுதி, அனுபவம் & திறன்கள்:', placeholderEn: 'e.g. 3 years experience as Agri Tractor Driver & Mechanic...', placeholderTa: 'எ.கா: 3 வருட டிராக்டர் ஓட்டுநர் மற்றும் மெக்கானிக் அனுபவம்...', buttonEn: 'Create Professional Resume / Bio-Data', buttonTa: 'தொழில்முறை பயோடேட்டா உருவாக்குக', resultTitleEn: 'Job-Winning Resume & Skills Highlight', resultTitleTa: 'முழுமையான பயோடேட்டா & தகுதிப்பட்டியல்', chipsEn: ['Driver & Transport Operator CV', 'Agri Sales Representative CV', 'Fresh Graduate Bio-Data'], chipsTa: ['ஓட்டுநர் பயோடேட்டா', 'விவசாய விற்பனை பிரதிநிதி CV', 'புதிய பட்டதாரி பயோடேட்டா']),
  'StatusO Quote Gen': _ToolConfig(labelEn: '✨ Theme or Mood for Status Quote (Image & Text):', labelTa: '✨ ஸ்டேட்டஸ் தத்துவம் / வரிகள் தலைப்பு:', placeholderEn: 'e.g. Hard work, motivation, mother love, farmer pride...', placeholderTa: 'எ.கா: உழைப்பு, தன்னம்பிக்கை, தாய் பாசம், விவசாய பெருமை...', buttonEn: 'Generate Visual Status Quote', buttonTa: 'ஸ்டேட்டஸ் தத்துவம் & படம் உருவாக்குக', resultTitleEn: 'StatusO Card & Poetic Lines', resultTitleTa: 'வாட்ஸ்அப் ஸ்டேட்டஸ் கார்டு & கவிதை வரிகள்', chipsEn: ['Farmer pride & hard work', 'Morning positive energy', 'Friendship & loyalty'], chipsTa: ['விவசாய உழைப்பு பெருமை', 'காலை நேர தன்னம்பிக்கை', 'உண்மையான நட்பு தத்துவம்']),
};

// ─── MAIN SCREEN ───
class AiHubScreen extends StatefulWidget {
  const AiHubScreen({super.key});

  @override
  State<AiHubScreen> createState() => _AiHubScreenState();
}

class _AiHubScreenState extends State<AiHubScreen> {
  // Colors
  static const _bg = Color(0xFF0a0f1e);
  static const _card = Color(0xFF111827);
  static const _border = Color(0xFF1e293b);
  static const _primary = Color(0xFF10b981);
  static const _primaryLight = Color(0x1510b981);
  static const _textColor = Color(0xFFe2e8f0);
  static const _textSecondary = Color(0xFF94a3b8);
  static const _textMuted = Color(0xFF64748b);
  static const _inputBg = Color(0xFF1e293b);

  final _gemini = GeminiService();
  final _historyService = HistoryService();
  final _secureStorage = const FlutterSecureStorage();
  final _inputController = TextEditingController();
  final _inputFocusNode = FocusNode();

  int _activeCategoryIndex = 0;
  String _activeTool = _categories[0].tools[0];
  String _language = 'Tamil';
  String _apiKey = '';
  String _output = '';
  bool _loading = false;
  int _quizNumQuestions = 5;
  String _quizDifficulty = 'Medium';

  // Attachment
  String? _attachmentPath;
  String? _attachmentBase64;
  String? _attachmentMimeType;
  String? _attachmentName;

  // Speech Recognition
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _speechAvailable = false;
  bool _isListening = false;
  String _liveSpeechText = '';

  _Category get _activeCategory => _categories[_activeCategoryIndex];

  @override
  void initState() {
    super.initState();
    _loadApiKey();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    try {
      _speechAvailable = await _speech.initialize(
        onError: (e) {
          if (mounted) setState(() => _isListening = false);
        },
        onStatus: (s) {
          if (s == 'done' || s == 'notListening') {
            if (mounted) setState(() => _isListening = false);
          }
        },
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    _speech.stop();
    _inputController.dispose();
    _inputFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadApiKey() async {
    final key = await _secureStorage.read(key: 'gemini-api-key') ??
        await _secureStorage.read(key: 'gemini_api_key');
    if (key != null && key.isNotEmpty && mounted) {
      setState(() => _apiKey = key);
    }
  }

  Future<void> _saveApiKey(String key) async {
    final cleanKey = key.trim();
    await _secureStorage.write(key: 'gemini-api-key', value: cleanKey);
    await _secureStorage.write(key: 'gemini_api_key', value: cleanKey);
    if (mounted) setState(() => _apiKey = cleanKey);

    // Sync to backend CRM & Supabase
    try {
      final user = Supabase.instance.client.auth.currentUser;
      final phone = user?.phone;
      if (phone != null && phone.isNotEmpty) {
        http.post(
          Uri.parse('${AppEnv.apiUrl}/api/profile/update'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'phone': phone, 'gemini_api_key': cleanKey}),
        ).catchError((_) {});

        final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
        final tenDigit = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
        await Supabase.instance.client
            .from('profiles')
            .update({'gemini_api_key': cleanKey})
            .or('phone.ilike.%$tenDigit%,whatsapp.ilike.%$tenDigit%');
      }
    } catch (_) {}
  }

  void _resetInputs() {
    _inputController.clear();
    _attachmentPath = null;
    _attachmentBase64 = null;
    _attachmentMimeType = null;
    _attachmentName = null;
    _output = '';
  }

  Future<void> _pickCamera() async {
    final picker = ImagePicker();
    final result = await picker.pickImage(source: ImageSource.camera, imageQuality: 60);
    if (result != null) {
      final bytes = await File(result.path).readAsBytes();
      setState(() {
        _attachmentPath = result.path;
        _attachmentBase64 = base64Encode(bytes);
        _attachmentMimeType = 'image/jpeg';
        _attachmentName = 'Camera Photo.jpg';
      });
    }
  }

  Future<void> _pickGallery() async {
    final picker = ImagePicker();
    final result = await picker.pickImage(source: ImageSource.gallery, imageQuality: 60);
    if (result != null) {
      final bytes = await File(result.path).readAsBytes();
      setState(() {
        _attachmentPath = result.path;
        _attachmentBase64 = base64Encode(bytes);
        _attachmentMimeType = result.mimeType ?? 'image/jpeg';
        _attachmentName = result.name;
      });
    }
  }

  Future<void> _handleGenerate({String? customPrompt, String? overrideTool}) async {
    final promptToUse = customPrompt ?? _inputController.text;
    final toolToUse = overrideTool ?? _activeTool;

    if (promptToUse.trim().isEmpty && _attachmentBase64 == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_language == 'Tamil' ? 'தயவுசெய்து உரை உள்ளிடவும்' : 'Please enter some text or attach a photo'),
        backgroundColor: Colors.redAccent,
      ));
      return;
    }

    setState(() { _loading = true; _output = ''; });

    try {
      final attachments = <Map<String, String>>[];
      if (_attachmentBase64 != null && _attachmentMimeType != null) {
        attachments.add({'base64': _attachmentBase64!, 'mimeType': _attachmentMimeType!});
      }

      ToolResponse result;

      switch (toolToUse) {
        case 'YouTube Summarizer':
          result = await _gemini.summarizeYouTube(promptToUse, _apiKey, _language);
          break;
        case 'Webpage Summarizer':
          result = await _gemini.summarizeWebpage(promptToUse, _apiKey, _language);
          break;
        case 'Text Summarizer':
          result = await _gemini.summarizeText(promptToUse, _apiKey, _language, attachments: attachments);
          break;
        case 'Crop Disease Analysis':
          result = await _gemini.analyzeCrop(promptToUse, _apiKey, _language, attachments: attachments);
          break;
        case 'Farming Insights':
          result = await _gemini.farmingInsights(promptToUse, _apiKey, _language);
          break;
        case 'TN E-Sevai Chat':
          result = await _gemini.eSevaiChat(promptToUse, _apiKey, _language);
          break;
        case 'Legal Translator':
          result = await _gemini.legalTranslator(promptToUse, _apiKey, _language);
          break;
        case 'Notes Maker':
          result = await _gemini.makeNotes(promptToUse, _apiKey, _language, attachments: attachments);
          break;
        case 'Email Crafter':
          result = await _gemini.craftEmail(promptToUse, _apiKey, _language);
          break;
        case 'Social Media Gen':
          result = await _gemini.socialMediaGen(promptToUse, _apiKey, _language);
          break;
        case 'Resume Improver':
          result = await _gemini.improveResume(promptToUse, _apiKey, _language);
          break;
        case 'StatusO Quote Gen':
          result = await _gemini.statusQuoteGen(promptToUse, 'Viral Status', _apiKey);
          break;
        case 'Quiz Creator':
          final quizRes = await _gemini.generateAndSaveQuiz(promptToUse, _quizNumQuestions, _quizDifficulty, _apiKey, _language, attachments: attachments);
          if (quizRes['error'] != null) {
            result = ToolResponse(text: '', error: quizRes['error']);
          } else {
            result = ToolResponse(text: '### 🎓 வினாடி வினா வெற்றிகரமாக உருவாக்கப்பட்டது!\n\n**$_quizNumQuestions கேள்விகள்** தயாராக உள்ளன.');
          }
          break;
        default:
          result = await _gemini.summarizeText(promptToUse, _apiKey, _language, attachments: attachments);
      }

      if (result.error != null && result.error!.isNotEmpty) {
        if (result.error!.toLowerCase().contains('api key')) {
          _showSettingsDialog();
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(result.error!),
          backgroundColor: Colors.redAccent,
        ));
      } else if (result.text.isNotEmpty) {
        setState(() => _output = result.text);
        // Save to history
        await _historyService.saveItem(
          tool: toolToUse,
          query: promptToUse.isNotEmpty ? promptToUse : (_attachmentName ?? 'AI Query'),
          result: result.text,
          language: _language,
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Error: $e'),
        backgroundColor: Colors.redAccent,
      ));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _copyToClipboard() async {
    if (_output.isNotEmpty) {
      await Clipboard.setData(ClipboardData(text: _output));
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Copied! 📋 AI response copied to clipboard.'),
        backgroundColor: _primary,
      ));
    }
  }

  Future<void> _shareViaWhatsApp() async {
    if (_output.isEmpty) return;
    final msg = '*SuprO AI Hub — $_activeTool*\n\n$_output\n\n_Generated via SuprO App_';
    final waUrl = 'whatsapp://send?text=${Uri.encodeComponent(msg)}';
    try {
      if (await canLaunchUrl(Uri.parse(waUrl))) {
        await launchUrl(Uri.parse(waUrl), mode: LaunchMode.externalApplication);
      } else {
        await _copyToClipboard();
      }
    } catch (e) {
      await _copyToClipboard();
    }
  }

  void _showSettingsDialog() {
    final keyController = TextEditingController(text: _apiKey);
    bool testing = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: _card,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(children: [
            const Icon(LucideIcons.keyRound, color: _primary, size: 20),
            const SizedBox(width: 8),
            const Text('AI Settings & API Key', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ]),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Google Gemini API Key:', style: TextStyle(color: _textColor, fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              TextField(
                controller: keyController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Paste your AI Studio API key (AIzaSy...)',
                  hintStyle: const TextStyle(color: _textMuted, fontSize: 12),
                  filled: true,
                  fillColor: _bg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _border)),
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => launchUrl(Uri.parse('https://aistudio.google.com/app/apikey'), mode: LaunchMode.externalApplication),
                child: const Row(children: [
                  Icon(LucideIcons.externalLink, color: Color(0xFF38bdf8), size: 14),
                  SizedBox(width: 4),
                  Text('Get a Free Gemini API Key from Google AI Studio', style: TextStyle(color: Color(0xFF38bdf8), fontSize: 11, decoration: TextDecoration.underline)),
                ]),
              ),
              const SizedBox(height: 10),
              const Row(children: [
                Icon(LucideIcons.checkCircle, color: _primary, size: 14),
                SizedBox(width: 6),
                Expanded(
                  child: Text('Synced with Profile & Saved Permanently across all AI tools', style: TextStyle(color: _primary, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ]),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () async {
                setDialogState(() => testing = true);
                final res = await _gemini.testApiKey(keyController.text.trim());
                setDialogState(() => testing = false);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(res['message'] ?? ''),
                  backgroundColor: res['success'] == true ? _primary : Colors.redAccent,
                ));
              },
              child: testing
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Test Key 🧪', style: TextStyle(color: Colors.white)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: _primary),
              onPressed: () async {
                await _saveApiKey(keyController.text);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Gemini API Key saved successfully! 🎉'),
                  backgroundColor: _primary,
                ));
              },
              child: const Text('Save Key', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showHistoryDialog() async {
    final items = await _historyService.getHistory();
    final groups = _historyService.getGroupedHistory(items);
    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _bg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.3,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollController) => Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(children: [
                      Icon(LucideIcons.history, color: _primary, size: 22),
                      SizedBox(width: 8),
                      Text('AI Tool History', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    ]),
                    Row(children: [
                      if (groups.isNotEmpty)
                        TextButton(
                          onPressed: () async {
                            await _historyService.clearHistory();
                            Navigator.pop(ctx);
                          },
                          child: const Text('Clear All', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
                        ),
                      IconButton(
                        icon: const Icon(LucideIcons.x, color: Colors.white),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ]),
                  ],
                ),
              ),
              const Divider(color: _border, height: 1),
              // Body
              Expanded(
                child: groups.isEmpty
                    ? Center(
                        child: Column(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(LucideIcons.history, size: 48, color: _textMuted),
                          const SizedBox(height: 12),
                          Text(_language == 'Tamil' ? 'வரலாறு இல்லை. AI உடன் ஏதாவது உருவாக்குங்கள்!' : 'No history found. Generate something with AI!', style: const TextStyle(color: _textMuted, fontSize: 14)),
                        ]),
                      )
                    : ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: groups.fold<int>(0, (sum, g) => sum + 1 + g.data.length),
                        itemBuilder: (ctx, index) {
                          int current = 0;
                          for (final group in groups) {
                            if (index == current) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 10, top: 8),
                                child: Text(group.title, style: const TextStyle(color: _primary, fontSize: 14, fontWeight: FontWeight.bold)),
                              );
                            }
                            current++;
                            for (final item in group.data) {
                              if (index == current) {
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: _card,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: _border),
                                  ),
                                  child: Row(children: [
                                    Expanded(
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _activeTool = item.tool;
                                            _inputController.text = item.query;
                                            _output = item.result;
                                          });
                                          Navigator.pop(ctx);
                                        },
                                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                                            Text(item.tool, style: const TextStyle(color: _primary, fontWeight: FontWeight.bold, fontSize: 13)),
                                            Text(DateTime.fromMillisecondsSinceEpoch(item.timestamp).toString().substring(0, 10), style: const TextStyle(color: _textMuted, fontSize: 11)),
                                          ]),
                                          const SizedBox(height: 4),
                                          Text(item.query, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: _textColor, fontSize: 12)),
                                        ]),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(LucideIcons.trash2, size: 16, color: Colors.redAccent),
                                      onPressed: () async {
                                        await _historyService.deleteItem(item.id);
                                        final newItems = await _historyService.getHistory();
                                        setSheetState(() {
                                          groups.clear();
                                          groups.addAll(_historyService.getGroupedHistory(newItems));
                                        });
                                      },
                                    ),
                                  ]),
                                );
                              }
                              current++;
                            }
                          }
                          return const SizedBox.shrink();
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVoiceModal() {
    final voiceController = TextEditingController(text: _inputController.text);
    bool isListening = false;
    String liveText = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.85),
          decoration: const BoxDecoration(
            color: _card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(top: BorderSide(color: _primary, width: 1.5)),
          ),
          padding: EdgeInsets.only(
            left: 18,
            right: 18,
            top: 18,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 18,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(LucideIcons.mic, size: 20, color: _primary),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _language == 'Tamil' ? 'குரல் AI (Kural Voice AI)' : 'Kural Voice Assistant',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ]),
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: _textSecondary, size: 22),
                    onPressed: () {
                      if (isListening) _speech.stop();
                      Navigator.pop(ctx);
                    },
                  ),
                ]),
                const SizedBox(height: 6),
                Text(
                  _language == 'Tamil'
                      ? 'நேரடியாகப் பேச தொடங்குங்கள் அல்லது விரைவு வினாவைத் தேர்ந்தெடுக்கவும்:'
                      : 'Speak directly or tap a quick voice prompt for instant AI response:',
                  style: const TextStyle(color: _textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 14),

                // ─── LIVE VOICE RECORDING TRIGGER BUTTON ───
                GestureDetector(
                  onTap: () async {
                    if (isListening) {
                      await _speech.stop();
                      setModalState(() => isListening = false);
                      setState(() => _isListening = false);
                    } else {
                      var status = await Permission.microphone.request();
                      if (!status.isGranted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(_language == 'Tamil' ? 'மைக்ரோஃபோன் அனுமதி தேவை' : 'Microphone permission is required'),
                          backgroundColor: Colors.redAccent,
                        ));
                        return;
                      }

                      if (!_speechAvailable) {
                        _speechAvailable = await _speech.initialize(
                          onError: (e) {
                            if (mounted) {
                              setModalState(() => isListening = false);
                              setState(() => _isListening = false);
                            }
                          },
                          onStatus: (s) {
                            if (s == 'done' || s == 'notListening') {
                              if (mounted) {
                                setModalState(() => isListening = false);
                                setState(() => _isListening = false);
                              }
                            }
                          },
                        );
                      }

                      if (_speechAvailable) {
                        setModalState(() {
                          isListening = true;
                          liveText = '';
                        });
                        setState(() => _isListening = true);

                        final locale = _language == 'Tamil' ? 'ta_IN' : 'en_IN';
                        try {
                          await _speech.listen(
                            localeId: locale,
                            onResult: (result) {
                              setModalState(() {
                                liveText = result.recognizedWords;
                                voiceController.text = result.recognizedWords;
                              });
                            },
                          );
                        } catch (_) {
                          setModalState(() => isListening = false);
                          setState(() => _isListening = false);
                        }
                      }
                    }
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    decoration: BoxDecoration(
                      color: isListening ? const Color(0xFFDC2626) : _primary,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: (isListening ? Colors.redAccent : _primary).withValues(alpha: 0.35),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(isListening ? LucideIcons.square : LucideIcons.mic, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          isListening
                              ? (_language == 'Tamil' ? '⏹️ பேசுகிறீர்கள்... (நிறுத்த தட்டவும்)' : '⏹️ Listening... (Tap to Stop)')
                              : (_language == 'Tamil' ? '🎙️ இப்போது பேச தொடங்குங்கள் (Voice Dictation)' : '🎙️ Start Speaking Now (Voice Dictation)'),
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),

                // ─── LIVE TRANSCRIPTION CONTAINER ───
                if (isListening || liveText.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _inputBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isListening ? Colors.redAccent : _primary),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: isListening ? Colors.redAccent : _primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            isListening
                                ? (_language == 'Tamil' ? 'நேரடி குரல் கேட்கப்படுகிறது...' : 'Listening to live speech...')
                                : (_language == 'Tamil' ? 'குரல் உள்ளீடு தயார்:' : 'Voice input captured:'),
                            style: TextStyle(
                              color: isListening ? Colors.redAccent : _primary,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ]),
                        const SizedBox(height: 6),
                        Text(
                          liveText.isNotEmpty ? liveText : (_language == 'Tamil' ? 'பேசுங்கள்...' : 'Speak now...'),
                          style: TextStyle(
                            color: liveText.isNotEmpty ? Colors.white : _textMuted,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (liveText.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              OutlinedButton.icon(
                                icon: const Icon(LucideIcons.check, size: 14, color: _primary),
                                label: Text(_language == 'Tamil' ? 'உள்ளீடு செய்' : 'Use in Query', style: const TextStyle(color: _primary, fontSize: 12)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: _primary),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                ),
                                onPressed: () {
                                  if (isListening) _speech.stop();
                                  _inputController.text = liveText.trim();
                                  Navigator.pop(ctx);
                                },
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                icon: const Icon(LucideIcons.zap, size: 14, color: Colors.black),
                                label: Text(_language == 'Tamil' ? 'உடனடி பதில் ⚡' : 'Run AI ⚡', style: const TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _primary,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                ),
                                onPressed: () {
                                  if (isListening) _speech.stop();
                                  _inputController.text = liveText.trim();
                                  Navigator.pop(ctx);
                                  _handleGenerate(customPrompt: liveText.trim());
                                },
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // ─── QUICK VOICE PROMPTS ───
                Text(
                  _language == 'Tamil' ? 'விரைவு வினாக்கள் (1-Tap Prompts):' : 'Quick Voice Prompts (1-Tap):',
                  style: const TextStyle(color: _textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                ..._voicePresets.map((preset) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _border),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(preset.iconEmoji, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(_language == 'Tamil' ? preset.tamil : preset.english, style: const TextStyle(color: _textColor, fontSize: 12, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 3),
                          Text(preset.tool, style: const TextStyle(color: _primary, fontSize: 11, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    ]),
                    const SizedBox(height: 8),
                    Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                      OutlinedButton.icon(
                        icon: const Icon(LucideIcons.fileText, size: 12, color: _textSecondary),
                        label: Text(_language == 'Tamil' ? 'உள்ளீடு' : 'Use', style: const TextStyle(color: _textSecondary, fontSize: 11)),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: _border), padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))),
                        onPressed: () {
                          if (isListening) _speech.stop();
                          final cat = _categories.indexWhere((c) => c.tools.contains(preset.tool));
                          setState(() {
                            if (cat >= 0) _activeCategoryIndex = cat;
                            _activeTool = preset.tool;
                            _inputController.text = _language == 'Tamil' ? preset.tamil : preset.english;
                          });
                          Navigator.pop(ctx);
                        },
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        icon: const Icon(LucideIcons.zap, size: 12, color: Colors.black),
                        label: Text(_language == 'Tamil' ? 'இயக்கு ⚡' : 'Run ⚡', style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(backgroundColor: _primary, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))),
                        onPressed: () {
                          if (isListening) _speech.stop();
                          final cat = _categories.indexWhere((c) => c.tools.contains(preset.tool));
                          if (cat >= 0) setState(() => _activeCategoryIndex = cat);
                          setState(() => _activeTool = preset.tool);
                          Navigator.pop(ctx);
                          _handleGenerate(customPrompt: _language == 'Tamil' ? preset.tamil : preset.english, overrideTool: preset.tool);
                        },
                      ),
                    ]),
                  ]),
                )),

                const SizedBox(height: 10),

                // ─── DIRECT TEXT INPUT ───
                Container(
                  decoration: BoxDecoration(
                    color: _inputBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _border),
                  ),
                  child: Row(children: [
                    Expanded(
                      child: TextField(
                        controller: voiceController,
                        style: const TextStyle(color: _textColor, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: _language == 'Tamil' ? 'குரல் வழியே பேச அல்லது தட்டச்சு செய்ய...' : 'Speak via keyboard mic or type query...',
                          hintStyle: const TextStyle(color: _textMuted, fontSize: 12),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(right: 4),
                      child: ElevatedButton.icon(
                        icon: const Icon(LucideIcons.zap, size: 14, color: Colors.black),
                        label: Text(_language == 'Tamil' ? 'இயக்கு' : 'Run', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                        style: ElevatedButton.styleFrom(backgroundColor: _primary, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        onPressed: () {
                          if (isListening) _speech.stop();
                          if (voiceController.text.trim().isNotEmpty) {
                            _inputController.text = voiceController.text.trim();
                            Navigator.pop(ctx);
                            _handleGenerate(customPrompt: voiceController.text.trim());
                          }
                        },
                      ),
                    ),
                  ]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final toolConfig = _toolConfigs[_activeTool];
    final inputLabel = _language == 'Tamil' ? (toolConfig?.labelTa ?? '✍️ உள்ளிடவும்:') : (toolConfig?.labelEn ?? '✍️ Describe your request:');
    final placeholder = _language == 'Tamil' ? (toolConfig?.placeholderTa ?? 'இங்கே தட்டச்சு செய்யவும்...') : (toolConfig?.placeholderEn ?? 'Type here...');
    final submitBtn = _language == 'Tamil' ? (toolConfig?.buttonTa ?? 'செயலாக்குக') : (toolConfig?.buttonEn ?? 'Process');
    final chips = _language == 'Tamil' ? (toolConfig?.chipsTa ?? []) : (toolConfig?.chipsEn ?? []);
    final isUrlTool = ['YouTube Summarizer', 'Webpage Summarizer'].contains(_activeTool);
    final isCropTool = _activeTool == 'Crop Disease Analysis';
    final isQuizTool = _activeTool == 'Quiz Creator';
    final showCamera = isCropTool || _activeTool == 'Notes Maker' || isQuizTool || _activeTool == 'Text Summarizer';

    return SafeArea(
      child: Column(
        children: [
          // ─── HEADER BAR ───
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: _card,
              border: Border(bottom: BorderSide(color: _border, width: 1)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  const Icon(LucideIcons.bot, color: _primary, size: 28),
                  const SizedBox(width: 10),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('SuprO AI Hub', style: TextStyle(color: _primary, fontSize: 20, fontWeight: FontWeight.bold)),
                    const Text('Aishlee Multi-Tool Assistant', style: TextStyle(color: _textSecondary, fontSize: 11)),
                  ]),
                ]),
                Row(children: [
                  // Language Toggle
                  GestureDetector(
                    onTap: () => setState(() => _language = _language == 'Tamil' ? 'English' : 'Tamil'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _primary),
                      ),
                      child: Text(_language == 'Tamil' ? 'தமிழ்' : 'Eng', style: const TextStyle(color: _primary, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Settings
                  GestureDetector(
                    onTap: _showSettingsDialog,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: _inputBg, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(LucideIcons.settings, color: _textSecondary, size: 20),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // History
                  GestureDetector(
                    onTap: _showHistoryDialog,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: _inputBg, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(LucideIcons.history, color: _textSecondary, size: 20),
                    ),
                  ),
                ]),
              ],
            ),
          ),

          // ─── SCROLLABLE BODY ───
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── CATEGORIES ───
                  SizedBox(
                    height: 46,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      itemCount: _categories.length,
                      itemBuilder: (_, idx) {
                        final cat = _categories[idx];
                        final isActive = _activeCategoryIndex == idx;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setState(() {
                              _activeCategoryIndex = idx;
                              _activeTool = cat.tools[0];
                              _resetInputs();
                            }),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isActive ? _primary : _card,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: isActive ? _primary : _border),
                              ),
                              child: Row(children: [
                                Icon(cat.icon, size: 16, color: isActive ? Colors.black : _textSecondary),
                                const SizedBox(width: 6),
                                Text(
                                  _language == 'Tamil' ? cat.tamil : cat.name,
                                  style: TextStyle(
                                    color: isActive ? Colors.black : _textSecondary,
                                    fontSize: 12,
                                    fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                                  ),
                                ),
                              ]),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 4),

                  // ─── MICRO-TOOLS CHIPS ───
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _activeCategory.tools.map((tool) {
                        final isActive = _activeTool == tool;
                        return GestureDetector(
                          onTap: () => setState(() {
                            _activeTool = tool;
                            _resetInputs();
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: isActive ? _primaryLight : _card,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isActive ? _primary : _border),
                            ),
                            child: Text(tool, style: TextStyle(
                              color: isActive ? _primary : _textSecondary,
                              fontSize: 12,
                              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                            )),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // ─── INPUT CARD ───
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 14),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Input Label & Voice AI
                        Row(children: [
                          Expanded(child: Text(inputLabel, style: const TextStyle(color: _textColor, fontSize: 13, fontWeight: FontWeight.w600))),
                          GestureDetector(
                            onTap: _showVoiceModal,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _primaryLight,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: _primary.withAlpha(64)),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                const Icon(LucideIcons.mic, size: 15, color: _primary),
                                const SizedBox(width: 4),
                                Text(_language == 'Tamil' ? 'குரல் AI' : 'Voice AI', style: const TextStyle(color: _primary, fontSize: 11, fontWeight: FontWeight.bold)),
                              ]),
                            ),
                          ),
                        ]),

                        const SizedBox(height: 10),

                        // Quick Prompt Chips
                        if (chips.isNotEmpty)
                          SizedBox(
                            height: 34,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: chips.length,
                              itemBuilder: (_, idx) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () => _inputController.text = chips[idx],
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                                    decoration: BoxDecoration(
                                      color: _inputBg,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: _border),
                                    ),
                                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                                      const Icon(LucideIcons.sparkles, size: 12, color: _primary),
                                      const SizedBox(width: 6),
                                      Text(chips[idx], style: const TextStyle(color: _textColor, fontSize: 12, fontWeight: FontWeight.w500)),
                                    ]),
                                  ),
                                ),
                              ),
                            ),
                          ),

                        if (chips.isNotEmpty) const SizedBox(height: 8),

                        // Media Buttons
                        if (showCamera)
                          Row(children: [
                            _buildAttachButton(LucideIcons.camera, _language == 'Tamil' ? 'கேமரா' : 'Camera', const Color(0xFF10b981), _pickCamera),
                            const SizedBox(width: 8),
                            _buildAttachButton(LucideIcons.image, _language == 'Tamil' ? 'படம்' : 'Gallery', const Color(0xFF38bdf8), _pickGallery),
                          ]),

                        if (showCamera) const SizedBox(height: 8),

                        // Attachment Chip
                        if (_attachmentName != null)
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: _inputBg,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: _primary.withAlpha(64)),
                            ),
                            child: Row(children: [
                              const Icon(LucideIcons.fileText, size: 16, color: _primary),
                              const SizedBox(width: 8),
                              Expanded(child: Text(_attachmentName!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: _textColor, fontSize: 12))),
                              GestureDetector(
                                onTap: () => setState(() {
                                  _attachmentPath = null;
                                  _attachmentBase64 = null;
                                  _attachmentMimeType = null;
                                  _attachmentName = null;
                                }),
                                child: const Icon(LucideIcons.x, color: Colors.redAccent, size: 18),
                              ),
                            ]),
                          ),

                        if (_attachmentName != null) const SizedBox(height: 8),

                        // Text Input
                        TextField(
                          controller: _inputController,
                          focusNode: _inputFocusNode,
                          maxLines: isUrlTool ? 1 : 4,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: placeholder,
                            hintStyle: const TextStyle(color: _textMuted, fontSize: 13),
                            filled: true,
                            fillColor: _bg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _border)),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _border)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _primary)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),

                        // Quiz Config
                        if (isQuizTool) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: _bg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: _border),
                            ),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(_language == 'Tamil' ? 'கேள்விகளின் எண்ணிக்கை:' : 'Number of Questions:', style: const TextStyle(color: _textSecondary, fontSize: 12)),
                              const SizedBox(height: 6),
                              Row(children: [5, 10, 20].map((n) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () => setState(() => _quizNumQuestions = n),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _quizNumQuestions == n ? const Color(0x2010b981) : _inputBg,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: _quizNumQuestions == n ? _primary : _border),
                                    ),
                                    child: Text('$n Qs', style: TextStyle(color: _quizNumQuestions == n ? _primary : _textSecondary, fontSize: 12, fontWeight: _quizNumQuestions == n ? FontWeight.bold : FontWeight.normal)),
                                  ),
                                ),
                              )).toList()),
                              const SizedBox(height: 12),
                              Text(_language == 'Tamil' ? 'கடினத்தன்மை நிலை:' : 'Difficulty Level:', style: const TextStyle(color: _textSecondary, fontSize: 12)),
                              const SizedBox(height: 6),
                              Row(children: ['Easy', 'Medium', 'Hard'].map((d) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () => setState(() => _quizDifficulty = d),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _quizDifficulty == d ? const Color(0x2010b981) : _inputBg,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: _quizDifficulty == d ? _primary : _border),
                                    ),
                                    child: Text(d, style: TextStyle(color: _quizDifficulty == d ? _primary : _textSecondary, fontSize: 12, fontWeight: _quizDifficulty == d ? FontWeight.bold : FontWeight.normal)),
                                  ),
                                ),
                              )).toList()),
                            ]),
                          ),
                        ],

                        const SizedBox(height: 12),

                        // Action Buttons
                        Row(children: [
                          // Voice Button
                          GestureDetector(
                            onTap: _showVoiceModal,
                            onLongPress: _showVoiceModal,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF34d399)),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                const Icon(LucideIcons.mic, size: 20, color: Colors.white),
                                const SizedBox(width: 6),
                                Text(_language == 'Tamil' ? 'குரல்' : 'Voice', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              ]),
                            ),
                          ),
                          const SizedBox(width: 10),
                          // Generate Button
                          Expanded(
                            child: GestureDetector(
                              onTap: _loading ? null : () => _handleGenerate(),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                decoration: BoxDecoration(
                                  color: _primary,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: _loading
                                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                      : Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            const Icon(LucideIcons.zap, size: 18, color: Colors.black),
                                            const SizedBox(width: 6),
                                            Flexible(
                                              child: Text(
                                                submitBtn,
                                                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 1,
                                              ),
                                            ),
                                          ],
                                        ),
                                ),
                              ),
                            ),
                          ),
                        ]),
                      ],
                    ),
                  ),

                  // ─── OUTPUT AREA ───
                  if (_output.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 14),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _primary.withAlpha(80)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Output Header
                          Container(
                            padding: const EdgeInsets.only(bottom: 10),
                            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: _border, width: 1))),
                            child: Row(children: [
                              const Icon(LucideIcons.sparkles, size: 18, color: _primary),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _language == 'Tamil' ? (toolConfig?.resultTitleTa ?? 'AI பதில்') : (toolConfig?.resultTitleEn ?? 'AI Response'),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ),
                              GestureDetector(onTap: _shareViaWhatsApp, child: const Padding(padding: EdgeInsets.symmetric(horizontal: 7), child: Icon(LucideIcons.share2, color: Color(0xFF22c55e), size: 20))),
                              GestureDetector(onTap: _copyToClipboard, child: const Padding(padding: EdgeInsets.symmetric(horizontal: 7), child: Icon(LucideIcons.copy, color: Color(0xFF38bdf8), size: 20))),
                            ]),
                          ),
                          const SizedBox(height: 14),
                          // Output Body - Rich formatted text
                          _buildRichOutput(_output),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttachButton(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: _inputBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }

  /// Render markdown-like output with basic bold/header support
  Widget _buildRichOutput(String text) {
    final lines = text.split('\n');
    final List<Widget> widgets = [];

    for (final line in lines) {
      if (line.startsWith('### ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 4),
          child: Text(line.substring(4), style: const TextStyle(color: Color(0xFFf59e0b), fontSize: 14, fontWeight: FontWeight.bold)),
        ));
      } else if (line.startsWith('## ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 12, bottom: 4),
          child: Text(line.substring(3), style: const TextStyle(color: Color(0xFF38bdf8), fontSize: 16, fontWeight: FontWeight.bold)),
        ));
      } else if (line.startsWith('# ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 14, bottom: 6),
          child: Text(line.substring(2), style: const TextStyle(color: _primary, fontSize: 18, fontWeight: FontWeight.bold)),
        ));
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(left: 8, top: 2, bottom: 2),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('• ', style: TextStyle(color: _primary, fontSize: 14)),
            Expanded(child: _buildBoldText(line.substring(2))),
          ]),
        ));
      } else if (line.trim().isEmpty) {
        widgets.add(const SizedBox(height: 6));
      } else {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 2, bottom: 2),
          child: _buildBoldText(line),
        ));
      }
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: widgets);
  }

  /// Parse **bold** text within a line
  Widget _buildBoldText(String text) {
    final parts = text.split(RegExp(r'\*\*'));
    if (parts.length <= 1) {
      return Text(text, style: const TextStyle(color: _textColor, fontSize: 14, height: 1.6));
    }

    final spans = <TextSpan>[];
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 == 1) {
        spans.add(TextSpan(text: parts[i], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)));
      } else {
        spans.add(TextSpan(text: parts[i]));
      }
    }
    return RichText(text: TextSpan(style: const TextStyle(color: _textColor, fontSize: 14, height: 1.6), children: spans));
  }
}
