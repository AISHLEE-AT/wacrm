import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/env.dart';

class TutoOciService {
  static const String baseUrl = AppEnv.apiUrl;

  /// 1. Sync Student Profile to OCI Postgres (Zero Supabase)
  static Future<bool> syncProfile({
    required String phone,
    required String fullName,
    required String academicClass,
    required String schoolBoard,
    required String futuristicAmbition,
    required String activeCourseId,
  }) async {
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/profile/sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': cleanPhone.isNotEmpty ? cleanPhone : 'anonymous',
          'fullName': fullName.trim(),
          'academicClass': academicClass,
          'schoolBoard': schoolBoard,
          'futuristicAmbition': futuristicAmbition,
          'activeCourseId': activeCourseId,
        }),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      print('TutoOciService.syncProfile error: $e');
      return false;
    }
  }

  /// 2. Fetch Today's Planner for Student & Day
  static Future<Map<String, dynamic>?> fetchTodayPlanner({
    required String phone,
    required String courseId,
    required String ambitionId,
    required int dayNumber,
  }) async {
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final url = Uri.parse(
        '$baseUrl/api/tuto/planner/today?phone=${Uri.encodeComponent(cleanPhone)}'
        '&courseId=${Uri.encodeComponent(courseId)}'
        '&ambitionId=${Uri.encodeComponent(ambitionId)}'
        '&dayNumber=$dayNumber',
      );
      final res = await http.get(url).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true) {
          return data;
        }
      }
      return null;
    } catch (e) {
      print('TutoOciService.fetchTodayPlanner error: $e');
      return null;
    }
  }

  /// 3. Toggle Class or Yoga Task Completion & Update Progress
  static Future<bool> toggleTask({
    required String phone,
    required String courseId,
    required int dayNumber,
    required String taskType, // 'class' | 'yoga' | 'daily_test'
    int? classIndex,
    required bool completed,
    required int xp,
  }) async {
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/planner/task/toggle'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': cleanPhone,
          'courseId': courseId,
          'dayNumber': dayNumber,
          'taskType': taskType,
          if (classIndex != null) 'classIndex': classIndex,
          'completed': completed,
          'xp': xp,
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('TutoOciService.toggleTask error: $e');
      return false;
    }
  }

  /// 4. Submit Student Day Mission (Module 1)
  static Future<bool> submitDayMission({
    required String studentName,
    required String studentPhone,
    required String academicClass,
    required String ambitionId,
    required String courseId,
    required int dayNumber,
    required int classesCompleted,
    int totalClasses = 10,
    required bool yogaCompleted,
    int testScore = 0,
    required int xpEarned,
    String studentNotes = '',
    String homeworkUrl = '',
  }) async {
    try {
      final cleanPhone = studentPhone.replaceAll(RegExp(r'\D'), '');
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/submissions/submit'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'studentName': studentName,
          'studentPhone': cleanPhone.isNotEmpty ? cleanPhone : '9876543210',
          'academicClass': academicClass,
          'ambitionId': ambitionId,
          'courseId': courseId,
          'dayNumber': dayNumber,
          'classesCompleted': classesCompleted,
          'totalClasses': totalClasses,
          'yogaCompleted': yogaCompleted,
          'testScore': testScore,
          'xpEarned': xpEarned,
          'studentNotes': studentNotes.trim(),
          'homeworkUrl': homeworkUrl,
        }),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('TutoOciService.submitDayMission error: $e');
      return false;
    }
  }

  /// 5. Fetch Student In-App Alerts (Module 2 Teacher Reviews)
  static Future<List<Map<String, dynamic>>> fetchStudentAlerts(String phone) async {
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      if (cleanPhone.isEmpty) return [];
      final res = await http.get(
        Uri.parse('$baseUrl/api/tuto/student/alerts?phone=${Uri.encodeComponent(cleanPhone)}'),
      ).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['alerts'] is List) {
          return List<Map<String, dynamic>>.from(data['alerts']);
        }
      }
      return [];
    } catch (e) {
      print('TutoOciService.fetchStudentAlerts error: $e');
      return [];
    }
  }

  /// 6. Dismiss Alert and Claim Bonus XP
  static Future<bool> dismissAlert(dynamic alertId) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/student/alerts/dismiss'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'alertId': alertId}),
      );
      return res.statusCode == 200;
    } catch (e) {
      print('TutoOciService.dismissAlert error: $e');
      return false;
    }
  }

  /// 7. Admin: Get Day Plan from OCI Cloud
  static Future<Map<String, dynamic>?> getAdminDayPlan({
    required String courseId,
    required String ambitionId,
    required int dayNumber,
  }) async {
    try {
      final res = await http.get(
        Uri.parse(
          '$baseUrl/api/tuto/admin/day-plan/get?courseId=${Uri.encodeComponent(courseId)}'
          '&ambitionId=${Uri.encodeComponent(ambitionId)}'
          '&dayNumber=$dayNumber',
        ),
      ).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true) {
          return data;
        }
      }
      return null;
    } catch (e) {
      print('TutoOciService.getAdminDayPlan error: $e');
      return null;
    }
  }

  /// 8. Admin: Save Custom Day Plan to OCI Cloud
  static Future<Map<String, dynamic>> saveAdminDayPlan({
    required String courseId,
    required String courseTitle,
    required int dayNumber,
    required List<dynamic> classes,
    Map<String, dynamic>? yoga,
    Map<String, dynamic>? dailyTest,
    String? topicTitle,
    String? chapterTitle,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/admin/day-plan/save'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'courseId': courseId,
          'courseTitle': courseTitle,
          'dayNumber': dayNumber,
          'classes': classes,
          'yoga': yoga,
          'dailyTest': dailyTest,
          'topicTitle': topicTitle ?? 'Day $dayNumber Curriculum Plan',
          'chapterTitle': chapterTitle ?? 'Term Progression',
        }),
      );
      final data = jsonDecode(utf8.decode(res.bodyBytes));
      return {
        'success': res.statusCode == 200 && data['success'] == true,
        'error': data['error'],
      };
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 9. Admin: List Student Day Submissions
  static Future<List<Map<String, dynamic>>> listSubmissions() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/tuto/submissions/list'),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['submissions'] is List) {
          return List<Map<String, dynamic>>.from(data['submissions']);
        }
      }
      return [];
    } catch (e) {
      print('TutoOciService.listSubmissions error: $e');
      return [];
    }
  }

  /// 10. Admin: Review Student Submission & Trigger Alert (Module 2)
  static Future<Map<String, dynamic>> reviewAndAlert({
    required int submissionId,
    required String teacherName,
    required String remarks,
    int rating = 5,
    int bonusXp = 100,
    bool sendWhatsApp = true,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/tuto/submissions/review-and-alert'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'submissionId': submissionId,
          'teacherName': teacherName,
          'remarks': remarks,
          'rating': rating,
          'bonusXp': bonusXp,
          'sendWhatsApp': sendWhatsApp,
        }),
      );
      final data = jsonDecode(utf8.decode(res.bodyBytes));
      return {
        'success': res.statusCode == 200 && data['success'] == true,
        'error': data['error'],
      };
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }
}
