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
  bool isLoading = true;

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

      setState(() {
        courses = response as List<dynamic>;
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching courses: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _openCourse(dynamic course) {
    // For now, since we don't have a course detail screen in Flutter, 
    // let's just open the links_data if it exists, or show a dialog.
    // In a full implementation, this should navigate to a Flutter version of TeachOCourseScreen.
    String? link = course['links_data'];
    if (link != null && link.isNotEmpty) {
      launchUrl(Uri.parse(link));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Course details coming soon in Flutter!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TeachO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFf59e0b)))
          : courses.isEmpty
              ? const Center(child: Text('No courses available right now.', style: TextStyle(color: Colors.white)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: courses.length,
                  itemBuilder: (context, index) {
                    final course = courses[index];
                    final title = course['title_name'] ?? 'Unknown Course';
                    final cat = course['category'] ?? 'General';
                    final desc = course['description_purpose'] ?? course['description'] ?? 'Learn and excel with TeachO.';
                    
                    return _buildCourseCard(title, cat, desc, course);
                  },
                ),
    );
  }

  Widget _buildCourseCard(String title, String cat, String desc, dynamic course) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        onTap: () => _openCourse(course),
        leading: const Icon(LucideIcons.graduationCap, color: Color(0xFFf59e0b)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text('$cat • $desc', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94a3b8))),
        trailing: const Icon(LucideIcons.playCircle, color: Color(0xFFf59e0b)),
      ),
    );
  }
}
