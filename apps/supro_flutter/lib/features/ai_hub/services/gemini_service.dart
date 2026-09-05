import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ToolResponse {
  final String text;
  final String? error;
  final String? source;
  ToolResponse({required this.text, this.error, this.source});
}

const List<String> _candidateModels = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

import '../../../core/env.dart';

const String _defaultModel = 'gemini-2.5-flash';
final String _cloudAiApi = '${AppEnv.apiUrl}/api/ai';

class GeminiService {
  // ─── Main prompt execution engine with Cloud Fallback ───
  Future<ToolResponse> executePrompt(
    String prompt, {
    String apiKey = '',
    String language = 'Tamil',
    List<Map<String, String>> attachments = const [],
    String modelName = _defaultModel,
  }) async {
    String effectiveKey = apiKey.trim();
    if (effectiveKey.isEmpty) {
      try {
        const storage = FlutterSecureStorage();
        effectiveKey = (await storage.read(key: 'gemini-api-key') ??
            await storage.read(key: 'gemini_api_key') ?? '').trim();
        if (effectiveKey.isEmpty) {
          final prefs = await SharedPreferences.getInstance();
          effectiveKey = (prefs.getString('gemini_api_key') ?? '').trim();
        }
      } catch (_) {}
    }

    final langInstructions = language == 'Tamil'
        ? 'Respond primarily in natural, clear, professional TAMIL language (தமிழ்). You may include key English technical terms in brackets where helpful.'
        : 'Respond clearly and professionally in ENGLISH language.';

    final fullPrompt = '$prompt\n\nLanguage Instruction:\n$langInstructions';

    // 1. Try Direct Google Gemini REST API
    if (effectiveKey.isNotEmpty) {
      final modelsToTry = modelName.isNotEmpty && !_candidateModels.contains(modelName)
          ? [modelName, ..._candidateModels]
          : _candidateModels;

      for (final candidate in modelsToTry) {
        try {
          final parts = <Map<String, dynamic>>[
            {'text': fullPrompt}
          ];

          for (final att in attachments) {
            if (att['base64'] != null && att['mimeType'] != null) {
              parts.add({
                'inlineData': {
                  'data': att['base64'],
                  'mimeType': att['mimeType'],
                }
              });
            }
          }

          final url = 'https://generativelanguage.googleapis.com/v1beta/models/$candidate:generateContent?key=$effectiveKey';
          final response = await http.post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'contents': [{'parts': parts}],
              'generationConfig': {
                'temperature': 0.7,
                'maxOutputTokens': 2048,
              },
            }),
          );

          final data = jsonDecode(response.body);
          if (response.statusCode == 200) {
            final text = data['candidates']?[0]?['content']?['parts']?[0]?['text'];
            if (text != null && text.toString().isNotEmpty) {
              return ToolResponse(text: text, source: 'direct');
            }
          }
          if (response.statusCode == 404) {
            continue; // try next candidate model
          }
        } catch (e) {
          // Continue to next candidate model
        }
      }
    }

    // 2. Cloud AI Fallback via SuprO Server
    try {
      final cloudRes = await http.post(
        Uri.parse(_cloudAiApi),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'prompt': fullPrompt,
          'type': 'general',
          if (apiKey.isNotEmpty) 'apiKey': apiKey,
        }),
      );

      final cloudData = jsonDecode(cloudRes.body);
      if (cloudRes.statusCode == 200 && cloudData['result'] != null) {
        return ToolResponse(text: cloudData['result'], source: 'cloud_proxy');
      }
      if (cloudData['error'] != null) {
        return ToolResponse(text: '', error: cloudData['error']);
      }
    } catch (e) {
      // Fall through
    }

    // 3. Fallback error
    if (apiKey.trim().isEmpty) {
      return ToolResponse(
        text: '',
        error: 'Please enter your free Google Gemini API key in the AI Hub Settings ⚙️ (get free key at https://aistudio.google.com/app/apikey) to unlock unlimited AI features.',
      );
    }
    return ToolResponse(
      text: '',
      error: 'Could not generate AI response. Please check your internet connection or Gemini API key.',
    );
  }

  // ─── Test API Key validity ───
  Future<Map<String, dynamic>> testApiKey(String apiKey) async {
    if (apiKey.trim().isEmpty) {
      return {'success': false, 'message': 'Please enter an API Key.'};
    }
    for (final candidate in _candidateModels) {
      try {
        final url = 'https://generativelanguage.googleapis.com/v1beta/models/$candidate:generateContent?key=${apiKey.trim()}';
        final res = await http.post(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'contents': [{'parts': [{'text': 'Respond with "OK" in 1 word.'}]}],
          }),
        );
        final data = jsonDecode(res.body);
        if (res.statusCode == 200 && data['candidates']?[0]?['content']?['parts']?[0]?['text'] != null) {
          return {'success': true, 'message': 'Gemini API Key is valid and active! 🎉 ($candidate)'};
        }
      } catch (e) {
        // Try next
      }
    }
    return {'success': false, 'message': 'Invalid API Key or connection error.'};
  }

  // ─── 1. SUMMARIZE AI TOOLS ───
  Future<ToolResponse> summarizeYouTube(String urlOrText, String apiKey, String language) {
    final prompt = '''You are an expert Content & Video Summarizer.
User Input: $urlOrText

Instructions:
1. If the input is a YouTube video link or title, identify the topic, key themes, and main discussion points.
2. Provide a structured, engaging summary:
   - 📌 **Main Topic & Context**
   - 🎯 **Key Highlights & Key Takeaways** (3-6 bullet points)
   - 💡 **Actionable Advice / Conclusion**
3. Use clean Markdown formatting.''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  Future<ToolResponse> summarizeWebpage(String urlOrText, String apiKey, String language) {
    final prompt = '''You are an expert Article & Webpage Summarizer.
User Input / Webpage Content: $urlOrText

Instructions:
1. Extract the core arguments, facts, figures, and important information.
2. Format as:
   - 📰 **Executive Overview** (2 sentences)
   - 🔑 **Key Points & Highlights** (bulleted)
   - 📊 **Important Data / Dates (if any)**
   - 📝 **Conclusion**
3. Keep it crisp, readable, and highly informative.''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  Future<ToolResponse> summarizeText(String text, String apiKey, String language, {List<Map<String, String>> attachments = const []}) {
    final prompt = '''You are an expert Text Summarizer.
Text to Summarize:
$text

Instructions:
1. Read the provided text or attached document thoroughly.
2. Provide:
   - 📋 **Summary Overview**
   - 🔍 **Core Takeaways (Bulleted)**
   - ⚡ **Key Quotes or Highlights**
3. Use bold text and clean Markdown for maximum readability.''';
    return executePrompt(prompt, apiKey: apiKey, language: language, attachments: attachments);
  }

  // ─── 2. AGRI & RURAL TOOLS ───
  Future<ToolResponse> analyzeCrop(String issue, String apiKey, String language, {List<Map<String, String>> attachments = const []}) {
    final prompt = '''You are a Senior Agricultural Scientist and Crop Doctor specializing in Tamil Nadu agriculture.

Farmer's Query / Description:
$issue

Instructions:
1. If an image is attached, carefully analyze leaves, stems, roots, or fruits for pests, fungi, bacteria, viruses, or nutrient deficiencies.
2. Structure the diagnostic report:
   - 🌾 **பயிர் / நோய் அடையாளம் (Identified Crop Issue / Disease)**
   - 🔍 **அறிகுறிகள் & காரணங்கள் (Symptoms & Causes)**
   - 🌿 **இயற்கை & நாட்டு மருந்து முறைகள் (Organic / Bio-control Solutions)**
   - 🧪 **பரிந்துரைக்கப்படும் மருந்துகள் & அளவு (Recommended Pesticides & Dosage)**
   - 🛡️ **எதிர்கால தடுப்பு முறைகள் (Future Prevention Tips)**
3. Use respectful, encouraging language for rural farmers.''';
    return executePrompt(prompt, apiKey: apiKey, language: language, attachments: attachments);
  }

  Future<ToolResponse> farmingInsights(String query, String apiKey, String language) {
    final prompt = '''You are an expert Tamil Nadu Agri Advisor & Market Analyst.
Farmer's Query: $query

Instructions:
1. Provide actionable farming advice covering soil health, crop selection, drip irrigation, fertilizer schedule, weather preparation, or mandi selling strategies.
2. Include government subsidy guidance (TNAU, Uzhavan App, PM-KISAN, Crop Insurance) where applicable.
3. Structure with clear bullet points and simple practical tips.''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  // ─── 3. GOVT & CITIZEN TOOLS ───
  Future<ToolResponse> eSevaiChat(String query, String apiKey, String language) {
    final prompt = '''You are the official "Virtual E-Sevai & Govt Schemes Guide" for Tamil Nadu citizens.
Citizen's Query: $query

Instructions:
1. Provide comprehensive guidance for Tamil Nadu Government Services & Schemes.
2. Structure the response:
   - 🏛️ **திட்டம் / சான்றிதழ் விவரம் (Scheme / Certificate Overview)**
   - 📄 **தேவையான ஆவணங்கள் (Mandatory Documents)**
   - 💻 **விண்ணப்பிக்கும் முறை (Application Guide)**
   - 💰 **அரசு கட்டணம் & கால அளவு (Fee & Processing Time)**
   - 🌐 **அதிகாரப்பூர்வ இணையதளம் (Official Portal)**''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  Future<ToolResponse> legalTranslator(String text, String apiKey, String language) {
    final prompt = '''You are a Legal Jargon Simplifier and Tamil-English Legal Translator.
Legal / Official Text to Simplify:
$text

Instructions:
1. Simplify complex legal phrasing into everyday plain language.
2. Structure:
   - ⚖️ **எளிய விளக்கம் (Plain Language Meaning)**
   - 📌 **முக்கிய நிபந்தனைகள் / உரிமைகள் (Key Conditions & Rights)**
   - ⚠️ **கவனிக்க வேண்டிய எச்சரிக்கைகள் (Important Warnings)**
   - 📝 **அடுத்த கட்ட நடவடிக்கை (Recommended Next Steps)**''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  // ─── 4. EDUCATION & QUIZ TOOLS ───
  Future<Map<String, dynamic>> generateAndSaveQuiz(String topic, int numQuestions, String difficulty, String apiKey, String language, {List<Map<String, String>> attachments = const []}) async {
    final prompt = '''You are an expert Examiner preparing a competitive test.
Create exactly $numQuestions multiple choice questions on the topic: "$topic".
Difficulty level: $difficulty.
${language == 'Tamil' ? 'The questions, options, and explanations MUST be in TAMIL.' : 'The questions, options, and explanations MUST be in ENGLISH.'}

CRITICAL: You MUST respond ONLY with a raw, valid JSON array without any markdown fences, backticks, or extra conversational text.
The JSON array MUST follow this exact schema:
[
  {
    "question": "வினா இங்கே?",
    "options": ["விடை A", "விடை B", "விடை C", "விடை D"],
    "answer": "விடை A",
    "explanation": "விளக்கம் இங்கே..."
  }
]''';

    try {
      final response = await executePrompt(prompt, apiKey: apiKey, language: language, attachments: attachments);
      if (response.error != null) return {'data': null, 'error': response.error};

      var rawText = response.text.trim();
      rawText = rawText.replaceAll(RegExp(r'^```json\s*'), '').replaceAll(RegExp(r'^```\s*'), '').replaceAll(RegExp(r'```\s*$'), '').trim();
      final jsonStart = rawText.indexOf('[');
      final jsonEnd = rawText.lastIndexOf(']');
      if (jsonStart != -1 && jsonEnd != -1) {
        rawText = rawText.substring(jsonStart, jsonEnd + 1);
      }

      final parsed = jsonDecode(rawText);
      if (parsed is! List || parsed.isEmpty) {
        throw Exception('Generated quiz array is empty.');
      }
      return {'data': parsed};
    } catch (e) {
      return {'data': null, 'error': 'Quiz parsing failed: $e'};
    }
  }

  Future<ToolResponse> makeNotes(String text, String apiKey, String language, {List<Map<String, String>> attachments = const []}) {
    final prompt = '''You are an expert Academic Tutor and Revision Notes Creator.
Topic / Study Material:
$text

Instructions:
1. Transform the input into structured, memorable revision notes.
2. Structure:
   - 📚 **Chapter / Concept Title**
   - 💡 **Core Concepts & Definitions**
   - 📌 **Key Points & Formulas / Dates to Remember**
   - ❓ **Top 3 Potential Exam Questions with Answers**
3. Use high-impact bold formatting and bullet points.''';
    return executePrompt(prompt, apiKey: apiKey, language: language, attachments: attachments);
  }

  // ─── 5. WORK & CONTENT TOOLS ───
  Future<ToolResponse> craftEmail(String context, String apiKey, String language) {
    final prompt = '''You are an expert Executive Email Writer.
Email Requirement / Context: $context

Instructions:
1. Write a professional, polite, and effective email with:
   - 📩 **Subject Line**: Punchy and clear
   - 👔 **Formal Greeting**
   - 📝 **Body Paragraphs**: Clear purpose, background, and call to action
   - 🤝 **Professional Sign-off**
2. Provide a secondary casual/friendly variation if appropriate.''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  Future<ToolResponse> socialMediaGen(String topic, String apiKey, String language) {
    final prompt = '''You are a Viral Social Media Marketing Specialist in Tamil Nadu.
Topic / Product: $topic

Instructions:
1. Create 2 high-converting social media posts:
   - 🎯 **Catchy Hook Line**
   - 📱 **Engaging Caption Body with Emojis**
   - 🏷️ **15 Trending Hashtags**
   - 💡 **Best Time to Post & Visual Idea**''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  Future<ToolResponse> improveResume(String text, String apiKey, String language) {
    final prompt = '''You are a Senior Technical Recruiter and Career Coach.
Resume Bullet Points / Experience:
$text

Instructions:
1. Rewrite the resume content using strong action verbs and measurable metrics.
2. Format as:
   - ✨ **Polished Impact Bullets (ATS-Optimized)**
   - 🔑 **Recommended Keywords & Skills to Highlight**
   - 💡 **Summary Statement for Top of Resume**''';
    return executePrompt(prompt, apiKey: apiKey, language: language);
  }

  // ─── 6. VIRAL & STATUSO TOOLS ───
  Future<ToolResponse> statusQuoteGen(String topic, String mood, String apiKey) {
    final prompt = '''You are a creative writer specializing in highly viral WhatsApp status quotes in Tamil Nadu.
Topic: $topic
Mood: $mood

Instructions:
1. Generate exactly ONE powerful, memorable, punchy 1-2 line quote in Tamil (or Tanglish if cinema/mass style).
2. DO NOT include any hashtags, markdown, quotes, or conversational text.
3. Return ONLY the raw quote text.''';
    return executePrompt(prompt, apiKey: apiKey, language: 'Tamil');
  }
}
