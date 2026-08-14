import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class TeachoScreen extends StatefulWidget {
  const TeachoScreen({super.key});

  @override
  State<TeachoScreen> createState() => _TeachoScreenState();
}

class _TeachoScreenState extends State<TeachoScreen> {
  List<dynamic> courses = [];
  bool isLoading = true;
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'TNPSC & Govt',
    'Agriculture',
    'Engineering & Tech',
    'Banking & Finance',
    'Language & Skills'
  ];

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    try {
      final response = await Supabase.instance.client
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'COURSE')
          .order('created_at', ascending: false);

      List<dynamic> list = response as List<dynamic>;

      // Fallback sample courses if DB is empty
      if (list.isEmpty) {
        list = [
          {
            'title_name': 'TNPSC Group 2/4 Full Mastery Course',
            'category': 'TNPSC & Govt',
            'description_purpose': 'Comprehensive coverage of General Tamil, Indian Polity, History, and Current Affairs.',
            'links_data': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'instructor': 'Dr. S. Ramanathan',
            'lessons_count': 42,
          },
          {
            'title_name': 'Precision Agriculture & Drone Farming',
            'category': 'Agriculture',
            'description_purpose': 'Modern soil nutrition, pesticide drone handling, drip irrigation, and high-yield methods.',
            'links_data': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'instructor': 'Prof. K. Murugan',
            'lessons_count': 28,
          },
          {
            'title_name': 'Full Stack Flutter & Supabase App Development',
            'category': 'Engineering & Tech',
            'description_purpose': 'Learn to build real-time multi-tenant mobile applications from scratch.',
            'links_data': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'instructor': 'Er. Aishlee Poovi',
            'lessons_count': 35,
          },
          {
            'title_name': 'Banking & Quantitative Aptitude Foundation',
            'category': 'Banking & Finance',
            'description_purpose': 'Speed mathematics, reasoning shortcuts, and mock interview preparations for IBPS & SBI.',
            'links_data': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'instructor': 'M. Kavitha MBA',
            'lessons_count': 50,
          },
        ];
      }

      setState(() {
        courses = list;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  void _openCourse(dynamic course) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CourseDetailScreen(course: course),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedCategory == 'All'
        ? courses
        : courses.where((c) => (c['category'] ?? '').toString().contains(_selectedCategory)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('TeachO Academy', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Category Selector Chips
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  onSelected: (_) => setState(() => _selectedCategory = cat),
                  selectedColor: const Color(0xFFF59E0B),
                  backgroundColor: const Color(0xFF111827),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // Course List
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : filtered.isEmpty
                    ? const Center(child: Text('No courses available in this category.', style: TextStyle(color: Colors.white)))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (context, index) {
                          final course = filtered[index];
                          final title = course['title_name'] ?? 'Unknown Course';
                          final cat = course['category'] ?? 'General';
                          final desc = course['description_purpose'] ?? course['description'] ?? 'Learn and excel with TeachO.';
                          final instructor = course['instructor'] ?? 'SuprO Certified Faculty';
                          final count = course['lessons_count'] ?? 24;

                          return GestureDetector(
                            onTap: () => _openCourse(course),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111827),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: const Color(0xFF1E293B)),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: const BoxDecoration(
                                      color: Color(0x26F59E0B),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(LucideIcons.graduationCap, color: Color(0xFFF59E0B), size: 28),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        Text('$cat • $count Lessons', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 12, fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 4),
                                        Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                                        const SizedBox(height: 8),
                                        Text('Instructor: $instructor', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  const Icon(LucideIcons.chevronRight, color: Color(0xFF94A3B8)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

// ─── COURSE DETAIL SCREEN ───
class CourseDetailScreen extends StatelessWidget {
  final dynamic course;

  const CourseDetailScreen({super.key, required this.course});

  void _launchVideo(BuildContext context) async {
    final link = course['links_data'] ?? 'https://www.youtube.com';
    final uri = Uri.parse(link);
    if (await canLaunchUrl(uri)) {
      launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open video URL.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = course['title_name'] ?? 'Course';
    final cat = course['category'] ?? 'General';
    final desc = course['description_purpose'] ?? course['description'] ?? 'Course syllabus and learning notes.';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: Text(title, style: const TextStyle(fontSize: 16)),
        backgroundColor: const Color(0xFF0A0F1E),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              height: 180,
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Center(
                child: IconButton(
                  iconSize: 64,
                  icon: const Icon(LucideIcons.playCircle, color: Color(0xFFF59E0B)),
                  onPressed: () => _launchVideo(context),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(cat, style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 16),
            const Text('Course Overview', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14, height: 1.5)),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () => _launchVideo(context),
                icon: const Icon(LucideIcons.play),
                label: const Text('Start Watching Lectures', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
