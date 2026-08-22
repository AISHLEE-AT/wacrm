import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class TeachoScreen extends StatefulWidget {
  const TeachoScreen({super.key});

  @override
  State<TeachoScreen> createState() => _TeachoScreenState();
}

class _TeachoScreenState extends State<TeachoScreen> {
  List<dynamic> courses = [];
  List<dynamic> filteredCourses = [];
  bool isLoading = true;
  String selectedCategory = 'All';
  String searchQuery = '';

  final List<String> categories = [
    'All',
    'LKG to 5th Grade',
    '6th to 10th Grade',
    '11th & 12th Grade',
    'TNPSC / UPSC / Govt Exams',
    'NEET / JEE',
    'Tech/IT'
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
          .inFilter('item_type', ['o_course_daily_plan', 'COURSE', 'course'])
          .order('created_at', ascending: false);

      setState(() {
        courses = response as List<dynamic>;
        _applyFilters();
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching courses: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _applyFilters() {
    setState(() {
      filteredCourses = courses.where((c) {
        final title = (c['title_name'] ?? '').toString().toLowerCase();
        final desc = (c['description_purpose'] ?? c['description'] ?? '').toString().toLowerCase();
        final cat = (c['category'] ?? '').toString();

        final matchesSearch = searchQuery.isEmpty || title.contains(searchQuery.toLowerCase()) || desc.contains(searchQuery.toLowerCase());
        final matchesCat = selectedCategory == 'All' || cat.toLowerCase().contains(selectedCategory.toLowerCase());

        return matchesSearch && matchesCat;
      }).toList();
    });
  }

  void _openCourseDetails(dynamic course) {
    dynamic ai = course['additional_info'];
    if (ai is String) {
      try { ai = jsonDecode(ai); } catch (e) {}
    }

    List<dynamic> modules = [];
    if (ai != null && ai['curriculum'] is List) {
      modules = ai['curriculum'];
    } else if (ai != null && ai['dayPlans'] is List) {
      modules = (ai['dayPlans'] as List).take(20).map((dp) {
        return {
          'title': dp['themeTitle'] ?? dp['phaseTitle'] ?? 'Day ${dp['dayNumber']} Learning Plan',
          'description': 'Duration: ${dp['totalDurationMins'] ?? 120} Mins',
          'videos': (dp['tasks'] as List? ?? []).map((t) => {
            'title': t['topic'] ?? '${t['subject'] ?? 'Lesson'}',
            'videoId': t['videoId'] ?? '0TgLtF3PMOc',
            'duration': '${t['durationMinutes'] ?? 25} Mins',
            'subject': t['subject'] ?? 'Core',
            'overview': t['subtopic'] ?? 'Core syllabus practice and concept mastery.'
          }).toList()
        };
      }).toList();
    }

    if (modules.isEmpty) {
      modules = [
        {
          'title': 'Module 1: Foundations & Core Concepts',
          'videos': [
            {'title': 'Introduction & Key Principles', 'videoId': '0TgLtF3PMOc', 'duration': '20 Mins'},
            {'title': 'Textbook Solved Examples', 'videoId': 'L0gG39p1p7k', 'duration': '30 Mins'}
          ]
        },
        {
          'title': 'Module 2: Advanced Practice & Problem Solving',
          'videos': [
            {'title': 'Derivations and Formulas', 'videoId': 'fJ9rUzIMcZQ', 'duration': '25 Mins'},
            {'title': 'Exam Question Walkthrough', 'videoId': 'M7lc1UVf-VE', 'duration': '35 Mins'}
          ]
        }
      ];
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollController,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    course['title_name'] ?? 'Course Masterclass',
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${course['category'] ?? 'Academics'} • ${modules.length} Modules',
                    style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  ...modules.map((m) {
                    final videos = m['videos'] as List? ?? [];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ExpansionTile(
                        iconColor: const Color(0xFFF59E0B),
                        collapsedIconColor: Colors.white54,
                        title: Text(
                          m['title'] ?? 'Module',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        subtitle: Text(
                          '${videos.length} Video Lessons',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                        children: videos.map<Widget>((v) {
                          return ListTile(
                            leading: const Icon(LucideIcons.playCircle, color: Color(0xFFF59E0B), size: 22),
                            title: Text(v['title'] ?? 'Lesson', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            subtitle: Text(v['duration'] ?? '20 Mins', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                            trailing: TextButton(
                              onPressed: () {
                                final vidId = v['videoId'] ?? '0TgLtF3PMOc';
                                launchUrl(Uri.parse('https://www.youtube.com/watch?v=$vidId'), mode: LaunchMode.externalApplication);
                              },
                              child: const Text('Watch', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(LucideIcons.graduationCap, color: Color(0xFFF59E0B)),
            const SizedBox(width: 8),
            const Text('TeachO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
              ),
              child: const Text('கல்வி', style: TextStyle(fontSize: 10, color: Color(0xFFFCD34D), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search & Category Chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              onChanged: (val) {
                searchQuery = val;
                _applyFilters();
              },
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search courses, subjects, TNPSC, NEET...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                prefixIcon: const Icon(LucideIcons.search, color: Color(0xFF64748B), size: 18),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
              ),
            ),
          ),

          // Category Scroll Bar
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, idx) {
                final cat = categories[idx];
                final isSelected = selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat, style: TextStyle(fontSize: 12, color: isSelected ? Colors.black : const Color(0xFF94A3B8), fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    selected: isSelected,
                    selectedColor: const Color(0xFFF59E0B),
                    backgroundColor: const Color(0xFF1E293B),
                    onSelected: (val) {
                      setState(() {
                        selectedCategory = cat;
                        _applyFilters();
                      });
                    },
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),

          // Course List
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : filteredCourses.isEmpty
                    ? const Center(child: Text('No courses found.', style: TextStyle(color: Color(0xFF94A3B8))))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredCourses.length,
                        itemBuilder: (context, index) {
                          final course = filteredCourses[index];
                          final title = course['title_name'] ?? 'Masterclass';
                          final cat = course['category'] ?? 'School & Academics';
                          final desc = course['description_purpose'] ?? course['description'] ?? 'Learn core principles, syllabus derivations, and progressive exam mastery.';

                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.only(bottom: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            child: InkWell(
                              onTap: () => _openCourseDetails(course),
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF59E0B).withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                                          ),
                                          child: Text(cat, style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 11, fontWeight: FontWeight.bold)),
                                        ),
                                        const Row(
                                          children: [
                                            Icon(LucideIcons.clock, size: 14, color: Color(0xFF94A3B8)),
                                            SizedBox(width: 4),
                                            Text('Daily 25m', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                    const SizedBox(height: 6),
                                    Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4)),
                                    const SizedBox(height: 14),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Free Masterclass', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600)),
                                        ElevatedButton.icon(
                                          onPressed: () => _openCourseDetails(course),
                                          icon: const Icon(LucideIcons.playCircle, size: 16, color: Colors.black),
                                          label: const Text('Learn Now', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFFF59E0B),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
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
