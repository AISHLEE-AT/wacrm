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
                              separatorBuilder: (_, _) => const SizedBox(width: 8),
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

  void _openCoursePlayer(String topicTitle, String initialTab) {
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
                          const Text('COURSE PLAYER EDITION • 6 MIN READ', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
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
                    _playerTabBtn('📖 Theory', 0, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _playerTabBtn('🗣️ தமிழ் விளக்கம்', 1, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _playerTabBtn('⚡ 1-Line Q&A', 2, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _playerTabBtn('📝 2-Mark & 5-Mark', 3, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _playerTabBtn('🎯 5 MCQs', 4, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
                    _playerTabBtn('📐 Formulas', 5, selectedTab, (idx) => setModalState(() => selectedTab = idx)),
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
                              child: Text('In this interactive Course Player lesson on "$topicTitle", we explore fundamental principles, mathematical formulations, and high-yield examination problem-solving techniques.',
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

  Widget _playerTabBtn(String label, int index, int current, Function(int) onTap) {
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
    _openCoursePlayer(title, promptType);
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

  List<Map<String, dynamic>> _getCourseUnits(String title) {
    final cleanTitle = title.toLowerCase();
    final isWeb = cleanTitle.contains('web') || cleanTitle.contains('full stack') || cleanTitle.contains('frontend') || cleanTitle.contains('backend') || cleanTitle.contains('react') || cleanTitle.contains('node') || cleanTitle.contains('javascript') || cleanTitle.contains('typescript');
    final isLkg = cleanTitle.contains('lkg') || cleanTitle.contains('lower kindergarten');
    final isUkg = cleanTitle.contains('ukg') || cleanTitle.contains('upper kindergarten');
    final isC1 = cleanTitle.contains('class 1') || cleanTitle.contains('1st standard') || cleanTitle.contains('1-ஆம் வகுப்பு');
    final isC2to5 = cleanTitle.contains('class 2') || cleanTitle.contains('2nd') || cleanTitle.contains('class 3') || cleanTitle.contains('3rd') || cleanTitle.contains('class 4') || cleanTitle.contains('4th') || cleanTitle.contains('class 5') || cleanTitle.contains('5th');
    final isC6to9 = cleanTitle.contains('class 6') || cleanTitle.contains('6th') || cleanTitle.contains('class 7') || cleanTitle.contains('7th') || cleanTitle.contains('class 8') || cleanTitle.contains('8th') || cleanTitle.contains('class 9') || cleanTitle.contains('9th');
    final is10th = cleanTitle.contains('10th') || cleanTitle.contains('sslc') || cleanTitle.contains('10-ஆம் வகுப்பு');
    final is11th = cleanTitle.contains('class 11') || cleanTitle.contains('11th') || cleanTitle.contains('plus one');
    final is12th = cleanTitle.contains('class 12') || cleanTitle.contains('12th') || cleanTitle.contains('plus two') || cleanTitle.contains('hsc');
    final isNeet = cleanTitle.contains('neet') || cleanTitle.contains('jee') || cleanTitle.contains('iit');
    final isTnpsc = cleanTitle.contains('tnpsc') || cleanTitle.contains('group') || cleanTitle.contains('vao') || cleanTitle.contains('police');

    if (isWeb) {
      return [
        {
          'subject': 'Frontend (HTML5, Tailwind & React 19)',
          'unit': 'Unit 1 & 2',
          'title': 'Modern UI/UX, Flexbox/Grid, TypeScript & Next.js App Router',
          'chapters': [
            {
              'title': 'Semantic Layouts, Tailwind CSS & V8 Event Loop',
              'tamil': 'வலை வடிவமைப்பு & ஜாவாஸ்கிரிப்ட்',
              'micros': ['Flexbox vs Grid matrix layouts', 'V8 Event Loop microtask priority', 'Tailwind CSS utility styling']
            },
            {
              'title': 'React Server Components & Next.js Server Actions',
              'tamil': 'ரியாக்ட் & நெக்ஸ்ட் ஜேஎஸ்',
              'micros': ['Server Components vs Client ("use client")', 'Zustand immutable state store', 'Next.js App Router streaming']
            }
          ]
        },
        {
          'subject': 'Backend & Cloud (Node.js, PostgreSQL, Docker)',
          'unit': 'Unit 3 & 4',
          'title': 'REST/GraphQL APIs, JWT Auth, Database Indexing & Docker',
          'chapters': [
            {
              'title': 'Express Middleware & JWT Token Rotation',
              'tamil': 'ஏபிஐ கட்டமைப்பு & பாதுகாப்பு',
              'micros': ['Access & HttpOnly Refresh Token Rotation', 'Stateless JWT Authentication', 'Input validation & Rate limiting']
            },
            {
              'title': 'PostgreSQL Indexing, Prisma ORM & Docker Multi-Stage',
              'tamil': 'டேட்டாபேஸ் & டாக்கர்',
              'micros': ['PostgreSQL B-Tree foreign key indexing', 'Prisma ORM migrations', 'Docker Alpine multi-stage builds']
            }
          ]
        }
      ];
    }

    if (isLkg || isUkg) {
      return [
        {
          'subject': 'தமிழ் (Tamil Early)',
          'unit': 'பகுதி 1',
          'title': isLkg ? 'உயிர் எழுத்துக்கள் (12) & எளிய பாட்டு' : 'மெய் எழுத்துக்கள் (18) & சொல் வளம்',
          'chapters': [
            {
              'title': isLkg ? 'அ முதல் ஔ வரை உயிர் எழுத்துக்கள்' : 'க் முதல் ன் வரை மெய் எழுத்துக்கள்',
              'tamil': 'எழுத்துப் பாடல்',
              'micros': [isLkg ? 'அ - அம்மா, ஆ - ஆடு படங்கள்' : 'க் - கொக்கு, ச் - சக்கரம் படங்கள்', 'ஒலி உச்சரிப்பு']
            }
          ]
        },
        {
          'subject': 'English (Phonics & ABC)',
          'unit': 'Unit 2',
          'title': isLkg ? 'Alphabet Phonics A to Z' : 'Sight Words & 3-Letter CVC Words',
          'chapters': [
            {
              'title': isLkg ? 'Letter sounds and picture tracing' : 'Cat, Dog, Sun word blending',
              'tamil': 'Phonics & Words',
              'micros': ['Phonic sounds A-Z', 'Rhyming sight words']
            }
          ]
        },
        {
          'subject': 'Mathematics',
          'unit': 'Unit 3',
          'title': isLkg ? 'Numbers 1 to 20 & Shapes' : 'Numbers 1 to 50 & Simple Addition',
          'chapters': [
            {
              'title': isLkg ? 'Counting 1 to 20 & Circle/Square' : 'Addition facts up to 10 (+)',
              'tamil': 'எண்கள் & வடிவங்கள்',
              'micros': ['Counting objects 1-20', 'Big vs Small comparison']
            }
          ]
        }
      ];
    }

    if (isC1 || isC2to5) {
      return [
        {
          'subject': 'தமிழ் (Tamil)',
          'unit': 'பகுதி 1',
          'title': 'செய்யுள், உரைநடை, நீதிநூல்கள் & எளிய இலக்கணம்',
          'chapters': [
            {
              'title': 'ஆத்திசூடி, கொன்றை வேந்தன் & நல்வழிப் பாடல்கள்',
              'tamil': 'நீதி இலக்கியம்',
              'micros': ['உயிர்மெய் எழுத்துக்கள் 216', 'பெயர்ச்சொல் & வினைச்சொல்']
            }
          ]
        },
        {
          'subject': 'English',
          'unit': 'Unit 2',
          'title': 'Grammar, Tenses, Nouns, Verbs & Comprehension',
          'chapters': [
            {
              'title': 'Action words, Tenses & Paragraph Writing',
              'tamil': 'Grammar Mechanics',
              'micros': ['Past/Present/Future tenses', 'Subject-Verb agreement']
            }
          ]
        },
        {
          'subject': 'Mathematics',
          'unit': 'Unit 3',
          'title': 'Numbers, Operations, Multiplication Tables & Fractions',
          'chapters': [
            {
              'title': 'Multiplication Tables, Long Division & Area/Perimeter',
              'tamil': 'கணித அடிப்படைகள்',
              'micros': ['Multiplication Tables 1-12', 'Dividend = Divisor x Quotient + Remainder']
            }
          ]
        },
        {
          'subject': 'Science / EVS',
          'unit': 'Unit 4',
          'title': 'Human Body Systems, Living Things & Solar System',
          'chapters': [
            {
              'title': 'Sense Organs, Food & Digestion, Circulatory System',
              'tamil': 'அறிவியல் அடிப்படைகள்',
              'micros': ['Heart & Lungs function', 'Photosynthesis in Plants']
            }
          ]
        }
      ];
    }

    if (isC6to9) {
      return [
        {
          'subject': 'தமிழ் (Tamil)',
          'unit': 'இயல் 1 & 2',
          'title': 'இன்பத்தமிழ், திராவிட மொழிக்குடும்பம் & இலக்கணம்',
          'chapters': [
            {
              'title': 'செய்யுள் நயம், உரைநடை உலகம் & தொடர் இலக்கணம்',
              'tamil': 'மொழி வளர்ச்சி',
              'micros': ['திராவிட மொழிக் குடும்பம்', 'சார்பெழுத்துக்கள் & வல்லினம் மிகும் இடங்கள்']
            }
          ]
        },
        {
          'subject': 'English',
          'unit': 'Unit 1 & 2',
          'title': 'Prose, Poetry Devices, Voices & Clauses',
          'chapters': [
            {
              'title': 'Transformational Grammar & Direct/Indirect Speech',
              'tamil': 'English Grammar',
              'micros': ['Active to Passive Voice', 'Clauses (Noun, Adverb Clauses)']
            }
          ]
        },
        {
          'subject': 'Mathematics',
          'unit': 'Unit 1 & 2',
          'title': 'Real Numbers, Polynomials, Geometry & Statistics',
          'chapters': [
            {
              'title': 'Algebraic Identities & Coordinate Distance Formula',
              'tamil': 'இயற்கணிதம் & வடிவியல்',
              'micros': ['Distance formula d = sqrt((x2-x1)^2 + (y2-y1)^2)', 'Identities (a+b)^2, a^2-b^2']
            }
          ]
        },
        {
          'subject': 'Science',
          'unit': 'Unit 1 & 2',
          'title': 'Laws of Motion, Atomic Structure & Tissues',
          'chapters': [
            {
              'title': 'Equations of Motion (v=u+at) & Bohr Model',
              'tamil': 'இயற்பியல் & வேதியியல்',
              'micros': ['v^2 = u^2 + 2as', 'Bohr Atom 2n^2 electron capacity']
            }
          ]
        }
      ];
    }

    if (is11th || is12th) {
      return [
        {
          'subject': 'Physics (இயற்பியல்)',
          'unit': 'Unit 1: Physics',
          'title': is11th ? 'Kinematics, Newton’s Laws & Thermodynamics' : 'Electrostatics, Current Electricity & Optics',
          'chapters': [
            {
              'title': is11th ? '2D Projectiles & Work-Energy Theorem' : 'Coulomb’s Law, Gauss’s Law & Wheatstone Bridge',
              'tamil': 'இயற்பியல் விதிகள்',
              'micros': [is11th ? 'R_max = u^2/g at 45°' : 'F = k*q1*q2/r^2', is11th ? 'W_net = Delta K' : 'P/Q = R/S']
            }
          ]
        },
        {
          'subject': 'Chemistry (வேதியியல்)',
          'unit': 'Unit 2: Chemistry',
          'title': is11th ? 'Atomic Structure & Chemical Bonding' : 'Electrochemistry, Chemical Kinetics & Organic',
          'chapters': [
            {
              'title': is11th ? 'Quantum Numbers & Aufbau Principle' : 'Nernst Equation & First Order Kinetics',
              'tamil': 'வேதியியல் சமன்பாடுகள்',
              'micros': [is11th ? 'Pauli exclusion & Hund rule' : 't_1/2 = 0.693/k', is11th ? 'Hybridization sp3, sp2' : 'E_cell = E0 - (0.0591/n)log Q']
            }
          ]
        },
        {
          'subject': 'Mathematics (கணிதம்)',
          'unit': 'Unit 3: Mathematics',
          'title': is11th ? 'Trigonometry & Differential Calculus' : 'Matrices, Integral Calculus & Differential Equations',
          'chapters': [
            {
              'title': is11th ? 'Product/Quotient Rules of Differentiation' : 'Matrix Inverses & Integration by Parts',
              'tamil': 'நுண்கணிதம் & அணிகள்',
              'micros': [is11th ? 'd/dx(x^n) = n*x^(n-1)' : 'A^-1 = (1/|A|) adj(A)', is11th ? 'Trig identities' : 'integral u dv = uv - integral v du']
            }
          ]
        },
        {
          'subject': 'Biology / Computer Science',
          'unit': 'Unit 4: Biology/CS',
          'title': is11th ? 'Cell Cycle, Photosynthesis & Python Loops' : 'Molecular Genetics & Relational SQL Databases',
          'chapters': [
            {
              'title': is11th ? 'Mitosis/Meiosis & Python Functions' : 'DNA Double Helix & SQL Joins/Aggregates',
              'tamil': 'உயிரியல் & கணினி',
              'micros': [is11th ? 'Calvin Cycle & Photosystems' : 'DNA Polymerase replication', is11th ? 'Python lists and dicts' : 'SQL SELECT JOIN GROUP BY']
            }
          ]
        }
      ];
    }

    if (is10th) {
      return [
        {
          'subject': 'தமிழ் (Tamil)',
          'unit': 'இயல் 1',
          'title': 'மொழி: அன்னை மொழியே & தமிழ்ச்சொல் வளம்',
          'chapters': [
            {
              'title': 'அன்னை மொழியே (செய்யுள்)',
              'tamil': 'பாவலரேறு பெருஞ்சித்திரனார்',
              'micros': ['கணிச்சாறு பாடல் நயம்', 'தமிழ் தொன்மை', 'எட்டுக் கொத்து & பத்துப்பாட்டு நயம்']
            },
            {
              'title': 'தமிழ்ச்சொல் வளம் (உரைநடை)',
              'tamil': 'தேவநேயப் பாவாணர்',
              'micros': ['அடிவகை & கிளைப் பிரிவுகள்', 'இலை, கொழுந்து வகைகள்', 'பிஞ்சு & குலை வகைகள்']
            },
            {
              'title': 'எழுத்து, சொல் இலக்கணம்',
              'tamil': 'கற்கண்டு',
              'micros': ['உயிரளபெடை & ஒற்றளபெடை', 'தனிமொழி, தொடர்மொழி, பொதுமொழி', 'தொழிற்பெயர் வகைகள்']
            }
          ]
        },
        {
          'subject': 'English',
          'unit': 'Unit 1',
          'title': 'His First Flight | Poem: Life | Active & Passive Voice',
          'chapters': [
            {
              'title': 'Prose: His First Flight',
              'tamil': 'முதல் பறத்தல் - Liam O’Flaherty',
              'micros': ['Young Seagull Flight Ledge', 'Parental Motivation & Fish bait', 'Overcoming Fear']
            },
            {
              'title': 'Poem: Life & Active/Passive Voice',
              'tamil': 'Henry Van Dyke & Grammar Rules',
              'micros': ['Rhyme Scheme & Figures of Speech', 'Active to Passive Conversion', 'Modal Verbs in Passive']
            }
          ]
        },
        {
          'subject': 'Mathematics (கணிதம்)',
          'unit': 'Unit 1 & 2',
          'title': 'Relations, Functions, Numbers & Sequences',
          'chapters': [
            {
              'title': 'Relations & Functions (உறவுகளும் சார்புகளும்)',
              'tamil': 'கார்டீசியன் பெருக்கல்',
              'micros': ['Cartesian Product n(AxB)=n(A)n(B)', 'Representation of Functions', 'Types of Functions (One-one, Onto)']
            },
            {
              'title': 'Numbers & Sequences (எண்களும் தொடர்வரிசைகளும்)',
              'tamil': 'யூக்ளிடின் வகுத்தல் முறை & கூட்டுத்தொடர்',
              'micros': ['Euclid Division Lemma a=bq+r', 'AP nth Term tn=a+(n-1)d', 'GP Sum & Special Series']
            }
          ]
        },
        {
          'subject': 'Science (அறிவியல்)',
          'unit': 'Unit 1 & 2',
          'title': 'Laws of Motion, Optics, Atoms & Molecules',
          'chapters': [
            {
              'title': 'Laws of Motion (இயக்க விதிகள்)',
              'tamil': 'நியூட்டனின் விதிகள் & உந்தம்',
              'micros': ['Inertia Types & Momentum p=mv', 'Newton II Law F=ma', 'Principle of Conservation of Momentum']
            },
            {
              'title': 'Optics & Human Eye (ஒளியியல்)',
              'tamil': 'ஒளிவிலகல் & லென்ஸ்கள்',
              'micros': ['Refraction Laws & Snell Law', 'Lens Formula 1/f = 1/v - 1/u', 'Myopia, Hypermetropia & Correction']
            }
          ]
        },
        {
          'subject': 'Social Science (சமூக அறிவியல்)',
          'unit': 'Unit 1 & 2',
          'title': 'World War Era, TN Freedom Struggle & Constitution',
          'chapters': [
            {
              'title': 'WWI & Freedom Struggle in Tamil Nadu',
              'tamil': 'சுதேசிக் கப்பல் & வேதாரண்யம் உப்பு சத்தியாகிரகம்',
              'micros': ['VOC Swadeshi Steam Navigation', 'Rajaji Vedaranyam Salt March', 'Non-Cooperation Movement in TN']
            },
            {
              'title': 'Indian Constitution & Economic Development',
              'tamil': 'இந்திய அரசியலமைப்பு & உரிமைகள்',
              'micros': ['Fundamental Rights (Articles 12-35)', 'Directive Principles of State Policy', 'Gross Domestic Product (GDP)']
            }
          ]
        }
      ];
    }

    if (isNeet) {
      return [
        {
          'subject': 'NEET Physics',
          'unit': 'Unit 1: Mechanics',
          'title': 'Kinematics, Newton’s Laws & Work-Energy',
          'chapters': [
            {
              'title': 'Projectile Motion & Vectors',
              'tamil': 'எறிபொருள் இயக்கம்',
              'micros': ['Trajectory Equation y = x tanθ - gx^2/2u^2cos^2θ', 'Maximum Range at 45°', 'Relative Velocity in 2D']
            },
            {
              'title': 'Rotational Motion & Moment of Inertia',
              'tamil': 'சுழற்சி இயக்கம்',
              'micros': ['Torque & Angular Momentum Conservation', 'Parallel Axis Theorem I = Icm + Md^2', 'Rolling Without Slipping']
            }
          ]
        },
        {
          'subject': 'NEET Physics',
          'unit': 'Unit 2: Electrodynamics',
          'title': 'Current Electricity & Photoelectric Effect',
          'chapters': [
            {
              'title': 'Current Electricity & Circuits',
              'tamil': 'மின்னோட்டவியல் & சுற்றுகள்',
              'micros': ['Drift Velocity I = n e A vd', 'Kirchhoff Laws & Wheatstone Bridge', 'Potentiometer Comparison']
            }
          ]
        }
      ];
    }

    if (isTnpsc) {
      return [
        {
          'subject': 'பொதுத்தமிழ்',
          'unit': 'பகுதி (அ)',
          'title': 'இலக்கணம்: வேர்ச்சொல், அகரவரிசை & திருக்குறள்',
          'chapters': [
            {
              'title': 'வேர்ச்சொல் & அகரவரிசைப்படுத்துதல்',
              'tamil': 'இலக்கணக் குறிப்புகள்',
              'micros': ['வல்லினம் மிகும் / மிகா இடங்கள்', 'அகரவரிசை விதிகளும் பயிற்சிகளும்', 'வேர்ச்சொல்லிலிருந்து வினைமுற்று அமைத்தல்']
            },
            {
              'title': 'திருக்குறள் 25 அதிகாரங்கள்',
              'tamil': 'அறத்துப்பால் குறட்பாக்கள்',
              'micros': ['அன்புடைமை & இனியவை கூறல்', 'பண்புடைமை & காலமறிதல்', 'பொருட்பால் முக்கிய குறள்கள்']
            }
          ]
        },
        {
          'subject': 'பொது அறிவு (GS)',
          'unit': 'Unit 8 & 9',
          'title': 'தமிழ்நாடு வரலாறு, கீழடி அகழாய்வு & திராவிட இயக்கம்',
          'chapters': [
            {
              'title': 'கீழடி, கொடுமணல் தொல்லியல் ஆய்வுகள்',
              'tamil': 'சங்க கால நகர நாகரிகம்',
              'micros': ['வைகை நதிக்கரை அகழாய்வுகள்', 'தமிழி (தமிழ்-பிராமி) எழுத்துப் பொறிப்புகள்', 'சங்க கால கடல்வழி வணிகம்']
            }
          ]
        }
      ];
    }

    return [
      {
        'subject': 'Core Foundations',
        'unit': 'Unit 1',
        'title': '$title — Core Principles & Formulations',
        'chapters': [
          {
            'title': '$title — Fundamentals & Theory',
            'tamil': 'அடிப்படை விதிகள்',
            'micros': ['Governing Axioms & Rules', 'Standard Formula Derivations', 'Conceptual Foundations']
          },
          {
            'title': '$title — Problem Solving & MCQs',
            'tamil': 'வினா-விடை தீர்வுகள்',
            'micros': ['High-Yield MCQ Patterns', 'Option Elimination Techniques', 'Previous Year Questions (PYQs)']
          }
        ]
      }
    ];
  }

  Widget _buildCurriculumTab(String title, String cat, String desc) {
    final units = _getCourseUnits(title);

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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                iconSize: 52,
                icon: const Icon(LucideIcons.playCircle, color: Color(0xFF10B981)),
                onPressed: _launchVideo,
              ),
              const Text('Play In-App Video Lecture (Full HD)', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
            ],
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
                onPressed: () => _askAi('tamil'),
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
        const SizedBox(height: 20),

        const Text('Comprehensive Syllabus & Micro-Topics', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),

        ...units.map((u) {
          final subject = u['subject'] as String;
          final unitNum = u['unit'] as String;
          final uTitle = u['title'] as String;
          final chapters = u['chapters'] as List<dynamic>;

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0F172A),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0x2610B981),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(subject, style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 6),
                                Text(unitNum, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(uTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => _openCoursePlayer(uTitle, 'theory'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: const Color(0xFF0A0F1E),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          minimumSize: const Size(60, 30),
                        ),
                        child: const Text('📱 Player', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                ...chapters.map((chap) {
                  final cTitle = chap['title'] as String;
                  final cTamil = chap['tamil'] as String?;
                  final micros = (chap['micros'] as List<dynamic>?) ?? [];

                  return Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(cTitle, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                                  if (cTamil != null)
                                    Text(cTamil, style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11)),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                InkWell(
                                  onTap: () => _openCoursePlayer(cTitle, 'theory'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(6)),
                                    child: const Text('Player', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                InkWell(
                                  onTap: () => _openCoursePlayer(cTitle, 'tamil'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(6)),
                                    child: const Text('தமிழ்', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        if (micros.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          ...micros.map((m) => InkWell(
                            onTap: () => _openCoursePlayer(m.toString(), 'theory'),
                            child: Container(
                              margin: const EdgeInsets.only(top: 4),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF1E293B)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text('• ${m.toString()}', style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                                  ),
                                  const Text('PYQ', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 9, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          )),
                        ],
                        const Divider(color: Color(0xFF1E293B), height: 16),
                      ],
                    ),
                  );
                }),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNotesTab(String title) {
    final units = _getCourseUnits(title);

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
        const SizedBox(height: 14),
        ...units.map((u) {
          final subject = u['subject'] as String;
          final unitNum = u['unit'] as String;
          final chapters = u['chapters'] as List<dynamic>;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$subject — $unitNum', style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              ...chapters.map((chap) {
                final cTitle = chap['title'] as String;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0x2638BDF8),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(LucideIcons.fileText, color: Color(0xFF38BDF8), size: 16),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(cTitle, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      ElevatedButton(
                        onPressed: () => _openCoursePlayer(cTitle, 'theory'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: const Color(0xFF0A0F1E),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          minimumSize: const Size(60, 30),
                        ),
                        child: const Text('Player PDF', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 10),
            ],
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


