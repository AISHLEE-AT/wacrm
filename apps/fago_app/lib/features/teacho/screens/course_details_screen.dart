import 'package:flutter/material.dart';
import '../models/course_model.dart';
import 'package:go_router/go_router.dart';

class CourseDetailsScreen extends StatelessWidget {
  final CourseModel course;

  const CourseDetailsScreen({super.key, required this.course});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: const Color(0xFF16161E),
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.cyan.withValues(alpha: 0.3), Colors.blue.withValues(alpha: 0.1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Center(
                  child: Icon(Icons.school_rounded, size: 80, color: Colors.white24),
                ),
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.cyan.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          course.type,
                          style: const TextStyle(color: Colors.cyan, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (course.classLevel != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            course.classLevel!,
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  Text(
                    course.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Curriculum Header
                  const Text(
                    'Curriculum',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  if (course.curriculum.isEmpty)
                    const Text(
                      'No curriculum available for this course.',
                      style: TextStyle(color: Colors.white54),
                    )
                  else
                    ...course.curriculum.map((module) => _buildModuleCard(context, module)),
                    
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF16161E),
          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: () {
              // TODO: Enroll or Start Learning
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.cyan,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Start Learning',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleCard(BuildContext context, dynamic module) {
    final String moduleTitle = module['title'] ?? 'Untitled Module';
    final List<dynamic> topics = module['topics'] ?? [];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF16161E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          iconColor: Colors.white54,
          collapsedIconColor: Colors.white54,
          title: Text(
            moduleTitle,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          children: topics.map<Widget>((topic) {
            final String topicTitle = topic['title'] ?? 'Untitled Topic';
            return ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_arrow_rounded, color: Colors.cyan, size: 16),
              ),
              title: Text(
                topicTitle,
                style: const TextStyle(color: Colors.white70, fontSize: 14),
              ),
              trailing: const Icon(Icons.chevron_right, color: Colors.white24, size: 20),
              onTap: () {
                // TODO: Open TopicViewer
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}
