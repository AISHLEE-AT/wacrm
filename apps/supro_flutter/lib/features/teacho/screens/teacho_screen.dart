import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../ai_hub/services/gemini_service.dart';
import 'career_hub_screen.dart';

const String _eduSupabaseUrl = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const String _eduAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';

class TeachoScreen extends StatefulWidget {
  const TeachoScreen({super.key});

  @override
  State<TeachoScreen> createState() => _TeachoScreenState();
}

class _TeachoScreenState extends State<TeachoScreen> {
  List<dynamic> _courses = [];
  List<dynamic> _tests = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _categories = [
    {'id': 'all', 'label': 'All Courses', 'icon': LucideIcons.bookOpen},
    {'id': 'entrance', 'label': 'NEET & JEE', 'icon': LucideIcons.zap},
    {'id': 'govt', 'label': 'Govt & TNPSC', 'icon': LucideIcons.award},
    {'id': 'skills', 'label': 'AI & Tech Skills', 'icon': LucideIcons.sparkles},
    {'id': 'school', 'label': 'School (KG–12)', 'icon': LucideIcons.graduationCap},
    {'id': 'college', 'label': 'College (UG/PG)', 'icon': LucideIcons.bookOpen},
    {'id': 'others', 'label': 'Others & General', 'icon': LucideIcons.layers},
    {'id': 'tests', 'label': 'TestO Mock Tests', 'icon': LucideIcons.fileCheck2},
  ];

  @override
  void initState() {
    super.initState();
    _fetchEducationData();
  }

  Future<void> _fetchEducationData() async {
    try {
      setState(() => _isLoading = true);

      // Fetch Courses from dedicated Supabase
      final coursesUri = Uri.parse('$_eduSupabaseUrl/rest/v1/unified_master_data?item_type=eq.COURSE&order=created_at.desc');
      final resCourses = await http.get(coursesUri, headers: {
        'apikey': _eduAnonKey,
        'Authorization': 'Bearer $_eduAnonKey',
      });

      if (resCourses.statusCode == 200) {
        _courses = jsonDecode(resCourses.body);
      }

      // Fetch Tests from dedicated Supabase
      final testsUri = Uri.parse('$_eduSupabaseUrl/rest/v1/unified_master_data?item_type=eq.o_test&limit=100');
      final resTests = await http.get(testsUri, headers: {
        'apikey': _eduAnonKey,
        'Authorization': 'Bearer $_eduAnonKey',
      });

      if (resTests.statusCode == 200) {
        _tests = jsonDecode(resTests.body);
      }
    } catch (e) {
      debugPrint('Error fetching education data: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getCourseCategory(dynamic c) {
    final cat = (c['category'] ?? '').toString().toLowerCase();
    final title = (c['title_name'] ?? '').toString().toLowerCase();

    if (cat.contains('neet') || cat.contains('jee') || RegExp(r'\b(neet|jee|iit|cuet|gate)\b', caseSensitive: false).hasMatch(title)) {
      return 'entrance';
    }
    if (cat.contains('tnpsc') || cat.contains('govt') || cat.contains('upsc') || RegExp(r'\b(tnpsc|upsc|civil services|group 1|group 2|group 4|group iv|ssc|chsl|cgl|rrb|ntpc|tnusrb|police|constable|si|forest guard|agniveer|cds|nda|tet|trb)\b', caseSensitive: false).hasMatch(title)) {
      return 'govt';
    }
    if (cat.contains('tech') || cat.contains('it training') || cat.contains('skill') || RegExp(r'செயற்கை நுண்ணறிவு|பைதான்|ஜாவாஸ்கிரிப்ட்|தரவு அறிவியல்|கிளவுட்|சைபர்|சாப்ட்வேர்|மொபைல் ஆப்|கணினி|மார்க்கெட்டிங்', caseSensitive: false).hasMatch(title) || RegExp(r'\b(python|javascript|data science|data analytics|cloud|aws|cyber security|mobile app|software testing|networking|digital marketing|web dev|coding|programming)\b', caseSensitive: false).hasMatch(title)) {
      return 'skills';
    }
    if (cat.contains('grade') || cat.contains('school') || RegExp(r'\b(class 8|class 9|class 10|class 11|class 12|8th standard|9th standard|10th standard|11th standard|12th standard|lkg|ukg|samacheer|cbse|tn board)\b', caseSensitive: false).hasMatch(title)) {
      return 'school';
    }
    if (cat.contains('ug') || cat.contains('college') || RegExp(r'\b(spoken english|engineering|computer architecture|degree|b\.tech|b\.sc|b\.com)\b', caseSensitive: false).hasMatch(title)) {
      return 'college';
    }
    return 'others';
  }

  List<dynamic> get _filteredItems {
    List<dynamic> list = _courses;
    if (_selectedCategory == 'tests') {
      list = _tests;
    } else if (_selectedCategory != 'all') {
      list = _courses.where((c) => _getCourseCategory(c) == _selectedCategory).toList();
    }

    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((item) {
        final title = (item['title_name'] ?? '').toString().toLowerCase();
        final cat = (item['category'] ?? '').toString().toLowerCase();
        final desc = (item['description_purpose'] ?? item['description'] ?? '').toString().toLowerCase();
        return title.contains(q) || cat.contains(q) || desc.contains(q);
      }).toList();
    }

    return list;
  }

  void _openCourse(dynamic course) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CourseDetailScreen(course: course),
      ),
    );
  }

  void _openVoiceSearchDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Voice Search • குரல் தேடல்', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              width: 70,
              height: 70,
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.mic, color: Color(0xFF0A0F1E), size: 36),
            ),
            const SizedBox(height: 12),
            const Text('Listening or select quick voice topic below:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'NEET UG Physics',
                'TNPSC பொதுத்தமிழ்',
                'JEE Main Maths',
                'Class 10 Science',
                'Python Programming',
                'Banking Aptitude',
              ].map((q) => ActionChip(
                backgroundColor: const Color(0xFF1E293B),
                label: Text(q, style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 12)),
                onPressed: () {
                  setState(() => _searchQuery = q);
                  Navigator.pop(ctx);
                },
              )).toList(),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recentCourse = _courses.isNotEmpty ? _courses[0] : null;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
            : RefreshIndicator(
                color: const Color(0xFF10B981),
                backgroundColor: const Color(0xFF111827),
                onRefresh: _fetchEducationData,
                child: ListView(
                  padding: const EdgeInsets.only(bottom: 40),
                  children: [
                    // Header & Stats Bar
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Text(
                                    'TeachO',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0x2610B981),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0x5010B981)),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 11),
                                        SizedBox(width: 4),
                                        Text('EduVerse AI', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0x26F97316),
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(color: const Color(0x50F97316)),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(LucideIcons.flame, color: Color(0xFFF97316), size: 14),
                                        SizedBox(width: 4),
                                        Text('5d', style: TextStyle(color: Color(0xFFF97316), fontWeight: FontWeight.bold, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0x2610B981),
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(color: const Color(0x5010B981)),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(LucideIcons.star, color: Color(0xFF10B981), size: 14),
                                        SizedBox(width: 4),
                                        Text('480 XP', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                          const SizedBox(height: 2),
                          const Text('School, Higher Ed, Competitive & Skills', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                          const SizedBox(height: 14),

                          // Search Bar with Voice Mic Button
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF111827),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF1E293B)),
                            ),
                            child: Row(
                              children: [
                                const Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                    decoration: const InputDecoration(
                                      hintText: 'Search subjects, lessons, TNPSC, NEET...',
                                      hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                                      border: InputBorder.none,
                                    ),
                                    onChanged: (v) => setState(() => _searchQuery = v),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.mic, color: Color(0xFF10B981), size: 18),
                                  onPressed: () => _openVoiceSearchDialog(context),
                                  constraints: const BoxConstraints(),
                                  padding: EdgeInsets.zero,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Categories Scroll
                          SizedBox(
                            height: 38,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: _categories.length,
                              separatorBuilder: (_, __) => const SizedBox(width: 8),
                              itemBuilder: (context, index) {
                                final cat = _categories[index];
                                final isSelected = _selectedCategory == cat['id'];
                                return InkWell(
                                  onTap: () => setState(() => _selectedCategory = cat['id']),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: isSelected ? const Color(0xFF10B981) : const Color(0xFF111827),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B)),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(cat['icon'] as IconData, size: 14, color: isSelected ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8)),
                                        const SizedBox(width: 6),
                                        Text(
                                          cat['label'],
                                          style: TextStyle(
                                            color: isSelected ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8),
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Continue Learning Widget
                          if (recentCourse != null && _selectedCategory == 'all' && _searchQuery.isEmpty) ...[
                            InkWell(
                              onTap: () => _openCourse(recentCourse),
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
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
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Icon(LucideIcons.clock, color: Color(0xFF38BDF8), size: 12),
                                            SizedBox(width: 4),
                                            Text('CONTINUE LEARNING', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                        Text('65% Complete', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Text(recentCourse['title_name'] ?? 'Recent Course', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 8),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(3),
                                      child: const LinearProgressIndicator(
                                        value: 0.65,
                                        backgroundColor: Color(0xFF1E293B),
                                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                                        minHeight: 6,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    const Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Next: Chapter 4 • Interactive Practice', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                                        Row(
                                          children: [
                                            Text('Resume', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                            Icon(LucideIcons.chevronRight, color: Color(0xFF10B981), size: 14),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Today's Daily 3 Tasks
                          if (_selectedCategory == 'all' && _searchQuery.isEmpty) ...[
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111827),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF1E293B)),
                              ),
                              child: const Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 16),
                                          SizedBox(width: 6),
                                          Text('Today\'s Learning Tasks', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text('+50 XP', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.checkCircle, color: Color(0xFF10B981), size: 16),
                                      SizedBox(width: 8),
                                      Text('Watch 1 Masterclass Video Lesson', style: TextStyle(color: Color(0xFF64748B), decoration: TextDecoration.lineThrough, fontSize: 12)),
                                    ],
                                  ),
                                  SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.circle, color: Color(0xFF475569), size: 16),
                                      SizedBox(width: 8),
                                      Text('Review Chapter Mind Map & Formula Notes', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12)),
                                    ],
                                  ),
                                  SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.circle, color: Color(0xFF475569), size: 16),
                                      SizedBox(width: 8),
                                      Text('Attempt 5 Daily Practice Questions', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Career & Placement Hub Quick Launcher
                            InkWell(
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CareerHubScreen())),
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF111827),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(LucideIcons.briefcase, color: Color(0xFF10B981), size: 18),
                                    ),
                                    const SizedBox(width: 12),
                                    const Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text('Career & Placement Hub', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                                              SizedBox(width: 4),
                                              Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 12),
                                            ],
                                          ),
                                          SizedBox(height: 2),
                                          Text('Job Alerts • AI Resume Builder • Mock Interviews', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                        ],
                                      ),
                                    ),
                                    const Icon(LucideIcons.chevronRight, color: Color(0xFF10B981), size: 16),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Section Heading
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _selectedCategory == 'tests' ? '📝 TestO Online Mock Exams' : '📚 Masterclass Courses',
                                style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                              ),
                              Text('${_filteredItems.length} Available', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Items List
                    if (_filteredItems.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(40),
                        child: Center(
                          child: Text('No courses or tests found in this category.', style: TextStyle(color: Color(0xFF94A3B8))),
                        ),
                      )
                    else
                      ...List.generate(_filteredItems.length, (index) {
                        final item = _filteredItems[index];
                        final isTest = item['item_type'] == 'o_test' || _selectedCategory == 'tests';
                        final title = item['title_name'] ?? 'Course';
                        final catKey = isTest ? 'tests' : _getCourseCategory(item);
                        final cat = isTest
                            ? 'TESTO EXAM'
                            : (item['category'] ??
                                (catKey == 'entrance'
                                    ? 'NEET / JEE'
                                    : catKey == 'govt'
                                        ? 'Govt & TNPSC'
                                        : catKey == 'skills'
                                            ? 'AI & Tech'
                                            : catKey == 'school'
                                                ? 'School (KG–12)'
                                                : catKey == 'college'
                                                    ? 'College'
                                                    : 'Others'));
                        final desc = item['description_purpose'] ?? item['description'] ?? 'Learn and master with EduVerse AI.';

                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          child: InkWell(
                            onTap: () => _openCourse(item),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111827),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF1E293B)),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isTest ? const Color(0x26F59E0B) : const Color(0x2610B981),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      isTest ? LucideIcons.fileCheck2 : LucideIcons.graduationCap,
                                      color: isTest ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: (isTest ? const Color(0xFFF59E0B) : const Color(0xFF10B981)).withValues(alpha: 0.15),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                cat,
                                                style: TextStyle(
                                                  color: isTest ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  const Icon(LucideIcons.chevronRight, color: Color(0xFF64748B), size: 18),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
      ),
    );
  }
}

// ─── COURSE DETAIL SCREEN WITH MULTI-TAB LMS & AI TUTOR ───
class CourseDetailScreen extends StatefulWidget {
  final dynamic course;
  const CourseDetailScreen({super.key, required this.course});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final _gemini = GeminiService();
  String _activeTab = 'curriculum'; // 'curriculum', 'notes', 'mindmap', 'forum'

  // Forum state
  final _forumController = TextEditingController();
  bool _isPostingForum = false;
  final List<Map<String, String>> _forumPosts = [
    {
      'author': 'Karthik R.',
      'question': 'How do we solve chapter numerical problems in under 60 seconds?',
      'answer': '🤖 AI Tutor: Identify the given values first, eliminate options with unit consistency, and memorize the 10 shortcut formulas.',
      'time': '2 hours ago',
    },
    {
      'author': 'Priya S.',
      'question': 'Where can I find the official Tamil Nadu State Board solution notes for Unit 2?',
      'answer': '🤖 AI Tutor: You can open the "Notes & PDF" tab right here to download the verified PDF summary and formula sheets.',
      'time': 'Yesterday',
    },
  ];

  void _launchVideo() async {
    final link = widget.course['links_data'] ?? 'https://www.youtube.com';
    final uri = Uri.parse(link);
    if (await canLaunchUrl(uri)) {
      launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openKindleBook(String topicTitle, String initialTab) {
    int selectedTab = initialTab == 'tamil'
        ? 1
        : initialTab == 'vsaq'
            ? 2
            : initialTab == 'solutions'
                ? 3
                : initialTab == 'quiz' || initialTab == 'mcq'
                    ? 4
                    : initialTab == 'formulas'
                        ? 5
                        : 0;

    int? selectedMcq;
    bool revealedVsaq = false;

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0A0F1E),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFF111827),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(LucideIcons.bookMarked, color: Color(0xFF10B981), size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('KINDLE BOOK EDITION • 6 MIN READ', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                          Text(topicTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, color: Color(0xFF94A3B8)),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),

              // Sub-Tabs
              Container(
                height: 44,
                color: const Color(0xFF0C1322),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  children: [
                    _kindleTabBtn('📖 Theory', 0, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _kindleTabBtn('🗣️ தமிழ் விளக்கம்', 1, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _kindleTabBtn('⚡ 1-Line Q&A', 2, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _kindleTabBtn('📝 2-Mark & 5-Mark', 3, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _kindleTabBtn('🎯 5 MCQs', 4, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _kindleTabBtn('📐 Formulas', 5, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                  ],
                ),
              ),

              // Body Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: selectedTab == 0
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(color: const Color(0x1A10B981), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x3310B981))),
                              child: Text('In this comprehensive Kindle lesson on "$topicTitle", we explore fundamental principles, mathematical formulations, and high-yield examination problem-solving techniques.',
                                  style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 13, height: 1.5)),
                            ),
                            const SizedBox(height: 14),
                            _conceptBox('1. Foundational Axioms & Definitions', 'The conceptual foundation of $topicTitle is rooted in standard academic frameworks. Every problem begins by identifying governing equations and boundary conditions.', '💡 Used in engineering systems to calculate efficiency and optimize performance.'),
                            const SizedBox(height: 12),
                            _conceptBox('2. Theoretical Breakdown & Derivations', 'By applying consistent step-by-step logic, complex multi-variable relationships are reduced to simple solvable algebraic forms. Always check SI unit consistency.', '💡 Standard Model: Rate equations ensure equilibrium state.'),
                            const SizedBox(height: 12),
                            _conceptBox('3. High-Yield Exam Traps & Shortcuts', 'Competitive examiners frequently test sign conventions and boundary assumptions. Checking dimensional consistency eliminates 2 options in under 30 seconds.', '💡 Exam Tip: Checking unit dimensions saves 45 seconds per question.'),
                          ],
                        )
                      : selectedTab == 1
                          ? Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(color: const Color(0x26F59E0B), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x50F59E0B))),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('எளிய தமிழ் விளக்கம்', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 4),
                                      Text('$topicTitle — எளிய தமிழில் முழு விளக்கம்', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      const Text('இந்த பாடத்தை நாம் அன்றாட வாழ்க்கையோடு ஒப்பிட்டு மிக எளிதாகப் புரிந்து கொள்ளலாம். எதையும் மனப்பாடம் செய்யாமல் அதன் அடிப்படை தத்துவத்தைப் புரிந்து கொண்டால் 100% மதிப்பெண் பெறலாம்.',
                                          style: TextStyle(color: Color(0xFFFEF08A), fontSize: 13, height: 1.5)),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                _conceptBox('நடைமுறை உதாரணம் (Real-Life Analogy)', 'உதாரணமாக, நாம் ஒரு சைக்கிள் ஓட்டும் போது சமநிலையைக் காப்பது போல, அல்லது கடையில் கணக்கிடுவது போல, இந்த பாடத்தின் விதிகளும் எளிய நடைமுறை தத்துவங்களின் அடிப்படையில் உருவானவை.', null),
                                const SizedBox(height: 12),
                                _conceptBox('முக்கிய நினைவூட்டல்கள் (Revision Points)', '• முதன்மை விதியைத் தெளிவாக நினைவில் வையுங்கள் (Core Principle).\n• சூத்திரங்களைப் பயன்படுத்தும் போது அலகுகளை (SI Units) கட்டாயம் சரிபார்க்கவும்.\n• வினாக்களில் கொடுக்கப்பட்டுள்ள மதிப்புகளை முதலில் எடுத்து எழுதுங்கள்.', null),
                              ],
                            )
                          : selectedTab == 2
                              ? Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(color: const Color(0x2638BDF8), borderRadius: BorderRadius.circular(10)),
                                      child: const Text('⚡ 1-Line Quick Recall Flashcards • Tap to Reveal', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                    const SizedBox(height: 12),
                                    _vsaqCard('Q1: What is the primary governing definition?', 'Standard relation establishing direct proportionality between input parameters and state responses.', revealedVsaq, () => setModalState(() => revealedVsaq = !revealedVsaq)),
                                    const SizedBox(height: 10),
                                    _vsaqCard('Q2: What is the standard SI unit for calculations?', 'Standard International (SI) coherent base units or normalized ratio units.', revealedVsaq, () => setModalState(() => revealedVsaq = !revealedVsaq)),
                                    const SizedBox(height: 10),
                                    _vsaqCard('Q3: Why is unit consistency critical?', 'Because mixing non-SI units leads to magnitude errors by powers of 10 in calculations.', revealedVsaq, () => setModalState(() => revealedVsaq = !revealedVsaq)),
                                  ],
                                )
                              : selectedTab == 3
                                  ? Column(
                                      children: [
                                        _solutionCard('Q1 [2 Marks]: Explain fundamental principle of $topicTitle', ['Step 1: State precise academic definition and standard governing equation.', 'Step 2: Define all variables and assumptions (e.g. constant temperature).', 'Step 3: State physical significance of the derived outcome.'], 'Examiners award 1 mark for formula and 1 mark for SI units.'),
                                        const SizedBox(height: 12),
                                        _solutionCard('Q2 [5 Marks]: Derive the standard equation and limitations', ['Step 1: Formulate initial differential relation from first principles.', 'Step 2: Integrate step-by-step showing intermediate substitutions.', 'Step 3: Apply boundary conditions to find constants.', 'Step 4: State the 2 conditions where this formula fails.'], 'Highlight final boxed formulas with SI units for full marks.'),
                                      ],
                                    )
                                  : selectedTab == 4
                                      ? Column(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(10)),
                                              child: const Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text('🎯 5 Micro-Topic Practice MCQs', style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold)),
                                                  Text('Instant Feedback', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            _mcqCard('In $topicTitle, what is the foundational governing relation?', ['A) Direct Linear Proportionality', 'B) Inverse Quadratic Equilibrium', 'C) Logarithmic Rate Decay', 'D) Discontinuous Variance'], 0, selectedMcq, (val) => setModalState(() => selectedMcq = val), 'Option A is correct because standard formulations assume first-order linear response.'),
                                          ],
                                        )
                                      : Column(
                                          children: [
                                            _formulaCard('F(x) = k * Delta_x', 'Linear Governing Equation (Restoring / Equilibrium response)', 'Fast Knowledge Always Delivers (F = k * Delta_x)'),
                                            const SizedBox(height: 10),
                                            _formulaCard('Efficiency = (Output / Input) * 100%', 'Efficiency Percentage Formula', 'Out Over In times Hundred'),
                                            const SizedBox(height: 10),
                                            _formulaCard('Error = |Delta_a / a| * 100%', 'Relative Percentage Error Calculation', 'Delta Over True Value'),
                                          ],
                                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _kindleTabBtn(String label, int index, int current, Function(int) onTap) {
    final active = index == current;
    return GestureDetector(
      onTap: () => onTap(index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        margin: const EdgeInsets.only(right: 6),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF10B981) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(label, style: TextStyle(color: active ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8), fontSize: 11, fontWeight: active ? FontWeight.bold : FontWeight.w600)),
        ),
      ),
    );
  }

  Widget _conceptBox(String title, String content, String? example) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF111827), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF1E293B))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(content, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, height: 1.5)),
          if (example != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0x2638BDF8), borderRadius: BorderRadius.circular(8)),
              child: Text(example, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontStyle: FontStyle.italic)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _vsaqCard(String q, String a, bool isRevealed, VoidCallback onToggle) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF111827), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF1E293B))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(q, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold))),
              TextButton(
                onPressed: onToggle,
                child: Text(isRevealed ? 'Hide' : 'Reveal Answer', style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          if (isRevealed) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(8)),
              child: Text('✓ $a', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _solutionCard(String q, List<String> steps, String tip) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF111827), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF1E293B))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q, style: const TextStyle(color: Color(0xFFA855F7), fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...steps.map((s) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(s, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, height: 1.4)),
              )),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: const Color(0x26F59E0B), borderRadius: BorderRadius.circular(8)),
            child: Text('💡 Tip: $tip', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _mcqCard(String q, List<String> opts, int correct, int? selected, Function(int) onSelect, String exp) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF111827), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF1E293B))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ...opts.asMap().entries.map((entry) {
            final idx = entry.key;
            final text = entry.value;
            final isChosen = selected == idx;
            final isAns = selected != null && idx == correct;
            final isWrong = isChosen && idx != correct;

            Color bg = const Color(0xFF0C1322);
            Color border = const Color(0xFF1E293B);
            if (selected != null) {
              if (isAns) {
                bg = const Color(0x3310B981);
                border = const Color(0xFF10B981);
              } else if (isWrong) {
                bg = const Color(0x33EF4444);
                border = const Color(0xFFEF4444);
              }
            }

            return GestureDetector(
              onTap: () => onSelect(idx),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                margin: const EdgeInsets.only(bottom: 6),
                decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8), border: Border.all(color: border)),
                child: Text(text, style: TextStyle(color: isAns ? const Color(0xFF10B981) : Colors.white, fontSize: 12, fontWeight: isAns ? FontWeight.bold : FontWeight.normal)),
              ),
            );
          }),
          if (selected != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0x2638BDF8), borderRadius: BorderRadius.circular(8)),
              child: Text('💡 $exp', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _formulaCard(String formula, String meaning, String mnemonic) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF111827), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF1E293B))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(8)),
            child: Text(formula, style: const TextStyle(color: Color(0xFF10B981), fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 13)),
          ),
          const SizedBox(height: 6),
          Text(meaning, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12)),
          const SizedBox(height: 4),
          Text('🧠 Mnemonic: $mnemonic', style: const TextStyle(color: Color(0xFFA855F7), fontSize: 11)),
        ],
      ),
    );
  }

  void _askAi(String promptType) {
    final title = widget.course['title_name'] ?? 'Topic';
    _openKindleBook(title, promptType);
  }

  void _postForumQuestion() async {
    final q = _forumController.text.trim();
    if (q.isEmpty) return;

    _forumController.clear();
    setState(() => _isPostingForum = true);

    final title = widget.course['title_name'] ?? 'Course';
    final prompt = 'Student asked a question in the course "$title": "$q". Provide a concise, helpful, and encouraging educational response in Tamil and English with practical steps.';

    try {
      final res = await _gemini.executePrompt(prompt);
      setState(() {
        _forumPosts.insert(0, {
          'author': 'You (Student)',
          'question': q,
          'answer': '🤖 AI Tutor: ${res.text}',
          'time': 'Just now',
        });
      });
    } catch (e) {
      setState(() {
        _forumPosts.insert(0, {
          'author': 'You (Student)',
          'question': q,
          'answer': 'Question posted to discussion board. AI Tutor will answer shortly.',
          'time': 'Just now',
        });
      });
    } finally {
      if (mounted) setState(() => _isPostingForum = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.course['title_name'] ?? 'Course';
    final cat = widget.course['category'] ?? 'General';
    final desc = widget.course['description_purpose'] ?? widget.course['description'] ?? 'Course syllabus and learning notes.';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Sub-Tab Switcher
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Row(
              children: [
                _buildSubTab('curriculum', 'Curriculum', LucideIcons.bookOpen),
                _buildSubTab('notes', 'Notes & PDF', LucideIcons.fileText),
                _buildSubTab('mindmap', 'Mind Map', LucideIcons.network),
                _buildSubTab('forum', 'Q&A Forum', LucideIcons.messageSquare),
              ],
            ),
          ),

          // Active Tab View
          Expanded(
            child: _activeTab == 'curriculum'
                ? _buildCurriculumTab(title, cat, desc)
                : _activeTab == 'notes'
                    ? _buildNotesTab(title)
                    : _activeTab == 'mindmap'
                        ? _buildMindMapTab(title)
                        : _buildForumTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildSubTab(String id, String label, IconData icon) {
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
              Icon(icon, size: 12, color: isActive ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8)),
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

  Widget _buildCurriculumTab(String title, String cat, String desc) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Video Preview Box
        Container(
          width: double.infinity,
          height: 170,
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Center(
            child: IconButton(
              iconSize: 56,
              icon: const Icon(LucideIcons.playCircle, color: Color(0xFF10B981)),
              onPressed: _launchVideo,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(cat, style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 12)),
        const SizedBox(height: 14),

        // AI Action Quick Pills
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _askAi('explain'),
                icon: const Icon(LucideIcons.sparkles, size: 13),
                label: const Text('தமிழில் விளக்கம்', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _askAi('quiz'),
                icon: const Icon(LucideIcons.fileCheck2, size: 13),
                label: const Text('5 MCQs', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: const Color(0xFF38BDF8),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _askAi('summary'),
                icon: const Icon(LucideIcons.fileText, size: 13),
                label: const Text('Notes', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: const Color(0xFFF59E0B),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        const Text('Course Overview & Syllabus', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.5)),
        const SizedBox(height: 20),

        SizedBox(
          width: double.infinity,
          height: 46,
          child: ElevatedButton.icon(
            onPressed: _launchVideo,
            icon: const Icon(LucideIcons.play, size: 16),
            label: const Text('Watch Video Lectures', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: const Color(0xFF0A0F1E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNotesTab(String title) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.fileText, color: Color(0xFF10B981), size: 18),
                  SizedBox(width: 8),
                  Text('Verified Digital Study Notes & PDFs', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                ],
              ),
              SizedBox(height: 4),
              Text('High-yield revision notes, formula sheets, and chapter summaries.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ...List.generate(3, (idx) {
          final chapName = idx == 0 ? 'Chapter 1: Core Fundamentals & Axioms' : idx == 1 ? 'Chapter 2: Formulas & Problem Techniques' : 'Chapter 3: Previous Year Exam Solutions (PYQ)';
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(LucideIcons.fileText, color: Color(0xFF38BDF8), size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(chapName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          const Text('PDF Document • Formulas & Theory', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _askAi('summary'),
                      icon: const Icon(LucideIcons.sparkles, size: 12, color: Color(0xFF10B981)),
                      label: const Text('Instant Summary', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _askAi('explain'),
                      icon: const Icon(LucideIcons.download, size: 12, color: Color(0xFF0A0F1E)),
                      label: const Text('Download Notes', style: TextStyle(color: Color(0xFF0A0F1E), fontSize: 11, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildMindMapTab(String title) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.network, color: Color(0xFFA855F7), size: 18),
                  SizedBox(width: 8),
                  Text('Visual Concept & Mind Map Graph', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                ],
              ),
              SizedBox(height: 4),
              Text('Accelerated memory retention through structured concept hierarchies.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF10B981), width: 1.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🎯 Core Theme', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.3,
          children: [
            _buildNodeCard('BRANCH 1', 'Key Principles', 'Fundamental definitions and structural axioms.', const Color(0xFF3B82F6)),
            _buildNodeCard('BRANCH 2', 'Formulas & Rules', 'Standard derivations and speed tricks.', const Color(0xFF10B981)),
            _buildNodeCard('BRANCH 3', 'Problem Patterns', 'Previous year exam questions (PYQs).', const Color(0xFFF59E0B)),
            _buildNodeCard('BRANCH 4', 'Self-Assessment', 'Timed mock tests and speed checks.', const Color(0xFFA855F7)),
          ],
        ),
        const SizedBox(height: 14),
        SizedBox(
          width: double.infinity,
          height: 46,
          child: ElevatedButton.icon(
            onPressed: () => _askAi('summary'),
            icon: const Icon(LucideIcons.sparkles, size: 16, color: Color(0xFF0A0F1E)),
            label: const Text('Generate AI Visual Mind Map Notes', style: TextStyle(color: Color(0xFF0A0F1E), fontWeight: FontWeight.bold, fontSize: 13)),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          ),
        ),
      ],
    );
  }

  Widget _buildNodeCard(String branch, String title, String desc, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: color.withValues(alpha: 0.4)),
            ),
            child: Text(branch, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Expanded(child: Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10))),
        ],
      ),
    );
  }

  Widget _buildForumTab() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.messageSquare, color: Color(0xFF10B981), size: 18),
                        SizedBox(width: 8),
                        Text('Doubt & Discussion Forum', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    SizedBox(height: 4),
                    Text('Ask questions and get instant solutions from AI Tutor & peers.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              ...List.generate(_forumPosts.length, (idx) {
                final post = _forumPosts[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(post['author']!, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontWeight: FontWeight.bold)),
                          Text(post['time']!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(post['question']!, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0A0F1E),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF1E293B)),
                        ),
                        child: Text(post['answer']!, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, height: 1.4)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),

        // Bottom Ask Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: const BoxDecoration(
            color: Color(0xFF111827),
            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _forumController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Ask a doubt or formula question...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF0A0F1E),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF10B981))),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: _isPostingForum ? null : _postForumQuestion,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: _isPostingForum
                      ? const Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0A0F1E))))
                      : const Icon(LucideIcons.send, size: 16, color: Color(0xFF0A0F1E)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}


