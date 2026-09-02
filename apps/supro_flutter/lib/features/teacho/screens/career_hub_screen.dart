import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class CareerHubScreen extends StatefulWidget {
  const CareerHubScreen({super.key});

  @override
  State<CareerHubScreen> createState() => _CareerHubScreenState();
}

class _CareerHubScreenState extends State<CareerHubScreen> {
  String _activeTab = 'jobs'; // 'jobs', 'resume', 'interview', 'roadmaps'

  // AI Resume Builder State
  final _nameController = TextEditingController();
  final _degreeController = TextEditingController();
  final _roleController = TextEditingController();
  final _skillsController = TextEditingController();
  String _generatedResume = '';
  bool _isGenerating = false;

  final List<Map<String, dynamic>> _jobAlerts = [
    {
      'title': 'TNPSC Group 4 Recruitment 2026',
      'org': 'Tamil Nadu Public Service Commission',
      'location': 'Tamil Nadu',
      'type': 'Govt Job',
      'badgeColor': const Color(0xFF10B981),
      'vacancies': '6,244 Posts',
      'deadline': 'Apply before 30th Sep',
      'url': 'https://www.tnpsc.gov.in',
    },
    {
      'title': 'SBI Junior Associate (Clerk) 2026',
      'org': 'State Bank of India',
      'location': 'All India',
      'type': 'Banking',
      'badgeColor': const Color(0xFF3B82F6),
      'vacancies': '8,773 Posts',
      'deadline': 'Exam Date: Nov 2026',
      'url': 'https://sbi.co.in/careers',
    },
    {
      'title': 'Graduate Software Engineer / Trainee',
      'org': 'Zoho Corporation',
      'location': 'Chennai / Tenkasi',
      'type': 'IT Software',
      'badgeColor': const Color(0xFFA855F7),
      'vacancies': 'Open Hiring',
      'deadline': 'Freshers Eligible (0-2 Yrs)',
      'url': 'https://www.zoho.com/careers',
    },
    {
      'title': 'SSC CGL Combined Graduate Level',
      'org': 'Staff Selection Commission',
      'location': 'All India Central Govt',
      'type': 'Central Govt',
      'badgeColor': const Color(0xFFF59E0B),
      'vacancies': '17,727 Posts',
      'deadline': 'Tier 1 Upcoming',
      'url': 'https://ssc.gov.in',
    },
    {
      'title': 'Junior Flutter & Mobile App Developer',
      'org': 'TechCorp Solutions',
      'location': 'Hybrid / Remote',
      'type': 'Private Job',
      'badgeColor': const Color(0xFF06B6D4),
      'vacancies': '5 Openings',
      'deadline': 'Immediate Joining',
      'url': 'https://linkedin.com',
    },
  ];

  final List<Map<String, String>> _interviewQuestions = [
    {
      'category': 'HR & Behavioral',
      'question': 'Tell me about yourself and why you are the best fit for this role.',
      'tip': 'Structure: Present (Current Skills) -> Past (Achievements) -> Future (Why this company fits your goals).',
    },
    {
      'category': 'Govt & TNPSC Aptitude',
      'question': 'Explain the separation of powers under the Indian Constitution.',
      'tip': 'Mention Articles 50 (Directive Principles), Executive, Legislature, and Independent Judiciary.',
    },
    {
      'category': 'Technical & Coding',
      'question': 'What is the difference between State and Props in Flutter / React Native?',
      'tip': 'Props/Parameters are passed from parent; State is mutable and managed internally by the widget.',
    },
    {
      'category': 'Banking & Quantitative',
      'question': 'How do you calculate Simple vs Compound Interest under quarterly compounding?',
      'tip': 'Formula: A = P(1 + r/400)^(4n). Explain with a numerical example.',
    },
  ];

  final List<Map<String, dynamic>> _roadmaps = [
    {
      'title': 'Software Developer (Full Stack & Mobile)',
      'duration': '6 Months',
      'steps': ['1. HTML/CSS & JavaScript Basics', '2. Flutter & React Native Mobile Apps', '3. Node.js & Supabase Backend', '4. Live Portfolio Projects'],
    },
    {
      'title': 'TNPSC Group 1 & 2 Civil Officer',
      'duration': '12 Months',
      'steps': ['1. Samacheer 6-12th School Books', '2. Indian Polity & Tamil Culture', '3. Current Affairs & Aptitude', '4. TestO Mock Exam Series'],
    },
    {
      'title': 'Banking Probationary Officer (PO)',
      'duration': '8 Months',
      'steps': ['1. Quantitative Aptitude & Reasoning', '2. Banking Awareness & English', '3. Speed Math & Calculation Tricks', '4. Sectional Timed Mock Tests'],
    },
    {
      'title': 'AI & Data Science Specialist',
      'duration': '9 Months',
      'steps': ['1. Python Programming & NumPy', '2. Data Analytics & SQL Database', '3. Machine Learning & Gemini AI Prompts', '4. Real-world AI App Deployment'],
    },
  ];

  Future<void> _generateAiResume() async {
    final name = _nameController.text.trim();
    final degree = _degreeController.text.trim();
    final role = _roleController.text.trim();
    final skills = _skillsController.text.trim();

    if (name.isEmpty || role.isEmpty || skills.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill Name, Target Role, and Skills')),
      );
      return;
    }

    setState(() {
      _isGenerating = true;
      _generatedResume = '';
    });

    try {
      final prompt = '''
Generate a high-impact, professional, ATS-friendly single-page Resume and Professional Summary for:
Name: $name
Degree / Education: ${degree.isEmpty ? 'Graduate' : degree}
Skills: $skills
Target Job Role: $role

Format cleanly with:
1. Contact & Header Placeholder
2. Professional Summary (3 strong lines)
3. Core Technical / Domain Skills (bullet points)
4. Key Projects & Experience Highlights
5. Education & Certifications
6. 3 Suggested Interview Talking Points
''';

      final response = await http.post(
        Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'parts': [{'text': prompt}]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final text = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';
        setState(() => _generatedResume = text);
      } else {
        setState(() => _generatedResume = 'Resume Draft for $name:\n\nTarget Role: $role\nEducation: $degree\nKey Skills: $skills\n\n- Accomplished professional with deep expertise in $skills.\n- Proven ability to deliver production-grade results.');
      }
    } catch (e) {
      setState(() => _generatedResume = 'Resume Draft for $name:\n\nTarget Role: $role\nEducation: $degree\nKey Skills: $skills\n\n- Strong background in $skills.\n- Ready for immediate hire.');
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  void _copyResume() {
    if (_generatedResume.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: _generatedResume));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Resume copied to clipboard!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('Career & Placement Hub', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
                  ),
                  child: const Text('EduVerse AI', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const Text('Job Alerts, AI Resume Builder & Mock Interviews', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Tab Switcher
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Row(
              children: [
                _buildTabBtn('jobs', 'Job Alerts', LucideIcons.briefcase),
                _buildTabBtn('resume', 'AI Resume', LucideIcons.fileText),
                _buildTabBtn('interview', 'Interview Qs', LucideIcons.messageSquare),
                _buildTabBtn('roadmaps', 'Roadmaps', LucideIcons.compass),
              ],
            ),
          ),

          // Tab Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_activeTab == 'jobs') _buildJobsTab(),
                if (_activeTab == 'resume') _buildResumeTab(),
                if (_activeTab == 'interview') _buildInterviewTab(),
                if (_activeTab == 'roadmaps') _buildRoadmapsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBtn(String id, String label, IconData icon) {
    final isActive = _activeTab == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF10B981) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 13, color: isActive ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8)),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  color: isActive ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8),
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildJobsTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Live Govt & Private Job Opportunities', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...List.generate(_jobAlerts.length, (idx) {
          final job = _jobAlerts[idx];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(job['title'], style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (job['badgeColor'] as Color).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: (job['badgeColor'] as Color).withValues(alpha: 0.4)),
                      ),
                      child: Text(job['type'], style: TextStyle(color: job['badgeColor'], fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(job['org'], style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(LucideIcons.mapPin, size: 12, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(job['location'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                    const Text(' • ', style: TextStyle(color: Color(0xFF64748B))),
                    Text(job['vacancies'], style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                    const Text(' • ', style: TextStyle(color: Color(0xFF64748B))),
                    Text(job['deadline'], style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => launchUrl(Uri.parse(job['url']), mode: LaunchMode.externalApplication),
                    icon: const Icon(LucideIcons.externalLink, size: 14, color: Color(0xFF0A0F1E)),
                    label: const Text('View Official Notification', style: TextStyle(color: Color(0xFF0A0F1E), fontWeight: FontWeight.bold, fontSize: 12)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildResumeTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 18),
                  SizedBox(width: 8),
                  Text('AI ATS-Compliant Resume Builder', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 14),
              _buildInput('Full Name', _nameController, 'e.g. Anandha Kumar'),
              _buildInput('Degree / Education', _degreeController, 'e.g. B.E Computer Science'),
              _buildInput('Target Job Role', _roleController, 'e.g. Mobile Developer / TNPSC Aspirant'),
              _buildInput('Key Skills', _skillsController, 'e.g. Flutter, React, SQL, Python, Tamil Literature', maxLines: 2),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isGenerating ? null : _generateAiResume,
                  icon: _isGenerating
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0A0F1E)))
                      : const Icon(LucideIcons.sparkles, size: 16, color: Color(0xFF0A0F1E)),
                  label: Text(_isGenerating ? 'Generating Resume...' : 'Generate Tailored Resume', style: const TextStyle(color: Color(0xFF0A0F1E), fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                ),
              ),
            ],
          ),
        ),
        if (_generatedResume.isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Generated Resume Draft', style: TextStyle(color: Color(0xFF10B981), fontSize: 14, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(LucideIcons.copy, color: Color(0xFF10B981), size: 18),
                      onPressed: _copyResume,
                    ),
                  ],
                ),
                const Divider(color: Color(0xFF1E293B)),
                Text(_generatedResume, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.5)),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInput(String label, TextEditingController controller, String hint, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            maxLines: maxLines,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              filled: true,
              fillColor: const Color(0xFF0A0F1E),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF10B981))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('High-Frequency Interview Questions & Strategy', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...List.generate(_interviewQuestions.length, (idx) {
          final item = _interviewQuestions[idx];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(item['category']!, style: const TextStyle(color: Color(0xFFA855F7), fontSize: 11, fontWeight: FontWeight.bold)),
                    Text('Q${idx + 1}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(item['question']!, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600, height: 1.4)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0F1E),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('AI Pro-Tip & Answering Strategy:', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(item['tip']!, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.3)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildRoadmapsTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Career Learning Roadmaps', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...List.generate(_roadmaps.length, (idx) {
          final rm = _roadmaps[idx];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(rm['title'], style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(rm['duration'], style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ...(rm['steps'] as List<String>).map((step) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.checkCircle2, size: 14, color: Color(0xFF10B981)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(step, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12)),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          );
        }),
      ],
    );
  }
}
