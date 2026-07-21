import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/course_model.dart';

class TeachOService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<CourseModel>> getCourses({
    String? classLevel,
    String? language,
    String? type,
  }) async {
    try {
      var query = _supabase.from('lms_courses').select();

      if (classLevel != null && classLevel != 'All') {
        query = query.eq('class_level', classLevel);
      }
      if (language != null && language != 'All') {
        query = query.eq('language', language);
      }
      if (type != null && type != 'All') {
        query = query.eq('type', type);
      }

      final response = await query.order('created_at', ascending: false);
      return (response as List).map((e) => CourseModel.fromJson(e)).toList();
    } catch (e) {
      debugPrint('Error fetching courses: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getCourseProgress(String userId, int courseId) async {
    try {
      final response = await _supabase
          .from('course_progress')
          .select()
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();
      return response;
    } catch (e) {
      debugPrint('Error fetching course progress: $e');
      return null;
    }
  }

  Future<void> updateCourseProgress(
    String userId, 
    int courseId, 
    List<String> completedTopics,
    bool isCompleted
  ) async {
    try {
      final status = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';
      await _supabase.from('course_progress').upsert({
        'user_id': userId,
        'course_id': courseId,
        'completed_topics': completedTopics,
        'status': status,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error updating course progress: $e');
      rethrow;
    }
  }
}
