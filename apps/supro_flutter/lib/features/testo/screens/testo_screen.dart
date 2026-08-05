import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';

class TestoScreen extends StatefulWidget {
  const TestoScreen({super.key});

  @override
  State<TestoScreen> createState() => _TestoScreenState();
}

class _TestoScreenState extends State<TestoScreen> {
  List<Map<String, dynamic>> sections = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTests();
  }

  Future<void> _fetchTests() async {
    try {
      final response = await Supabase.instance.client
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'o_test')
          .limit(2000);

      Map<String, List<dynamic>> groups = {};

      for (var item in (response as List<dynamic>)) {
        dynamic ai = item['additional_info'];
        if (ai is String) {
          try {
            ai = jsonDecode(ai);
          } catch (e) {}
        }

        if (ai != null && ai['questions'] != null && (ai['questions'] as List).isNotEmpty) {
          String title = item['title_name'] ?? '';
          String courseName = 'General Tests';
          String testName = title;

          if (title.contains(':')) {
            var parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.sublist(1).join(':').trim();
          }

          item['displayTitle'] = testName;
          item['questionCount'] = (ai['questions'] as List).length;

          if (!groups.containsKey(courseName)) {
            groups[courseName] = [];
          }
          groups[courseName]!.add(item);
        }
      }

      List<Map<String, dynamic>> formattedSections = groups.entries.map((e) => {
        'title': e.key,
        'data': e.value
      }).toList();

      setState(() {
        sections = formattedSections;
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching tests: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _openTest(dynamic test) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Test Exam Screen coming soon in Flutter!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        title: const Text('TestO'),
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF8b5cf6)))
          : sections.isEmpty
              ? const Center(child: Text('No tests available right now.', style: TextStyle(color: Colors.white)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: sections.length,
                  itemBuilder: (context, index) {
                    final section = sections[index];
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  section['title'],
                                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                              Text(
                                '${section['data'].length} Tests',
                                style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                        ...((section['data'] as List<dynamic>).map((test) => _buildTestCard(
                          test['displayTitle'] ?? test['title_name'],
                          '${test['questionCount']} Qs',
                          test
                        )).toList()),
                      ],
                    );
                  },
                ),
    );
  }

  Widget _buildTestCard(String title, String desc, dynamic test) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => _openTest(test),
        leading: const Icon(LucideIcons.award, color: Color(0xFF8b5cf6)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(desc, style: const TextStyle(color: Color(0xFF94a3b8))),
        trailing: const Icon(LucideIcons.chevronRight, color: Color(0xFF94a3b8)),
      ),
    );
  }
}
