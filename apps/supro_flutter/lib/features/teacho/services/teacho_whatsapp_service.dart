import 'package:url_launcher/url_launcher.dart';
import '../data/courses_catalog.dart';

class TeachoWhatsAppService {
  /// Format and send daily syllabus routine & active session alert to student WhatsApp
  static String formatDayPlanMessage({
    required String studentName,
    required String courseTitle,
    required int currentDay,
    required int totalDays,
    required List<TeachoTask> tasks,
    int streak = 1,
    int xp = 50,
  }) {
    final taskLines = tasks.asMap().entries.map((entry) {
      final idx = entry.key + 1;
      final t = entry.value;
      final subj = t.rawSubject.isNotEmpty ? '[${t.rawSubject}] ' : '';
      return '  $idx️⃣ $subj${t.title} (${t.duration})';
    }).join('\n');

    return '🔔 *SuprO TeachO • Daily Study Alert* 🔔\n\n'
        'வணக்கம் / Hello *$studentName*! 👋\n'
        'Your active learning session for *$courseTitle* is ready!\n\n'
        '📅 *Today\'s Milestone:* Day $currentDay of $totalDays\n'
        '🔥 *Streak:* $streak Days | ⭐ *Total XP:* $xp XP\n\n'
        '📋 *Today\'s 4-Step Learning Routine:*\n'
        '$taskLines\n\n'
        '🤖 *AI Doubt Solver:* Ask any doubt 24/7 in English & Tamil.\n'
        '📝 *TestO Assessment:* Take your 15-minute concept test to lock in XP.\n\n'
        '🚀 *Continue Learning:* https://supro.poovisri.com/teacho\n'
        '_Keep up the momentum and achieve Centum!_ ✨';
  }

  /// Dispatches WhatsApp alert via direct intent / deep link
  static Future<bool> sendDayPlanAlert({
    required String studentPhone,
    required String studentName,
    required String courseTitle,
    required int currentDay,
    required int totalDays,
    required List<TeachoTask> tasks,
    int streak = 1,
    int xp = 50,
  }) async {
    final cleanPhone = studentPhone.replaceAll(RegExp(r'\D'), '');
    final formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : '91$cleanPhone';
    final text = formatDayPlanMessage(
      studentName: studentName,
      courseTitle: courseTitle,
      currentDay: currentDay,
      totalDays: totalDays,
      tasks: tasks,
      streak: streak,
      xp: xp,
    );

    final uri = Uri.parse('https://wa.me/$formattedPhone?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }

  /// Sends instant course enrollment welcome alert
  static Future<bool> sendCourseRegistrationWelcome({
    required String studentPhone,
    required String studentName,
    required String courseTitle,
    required int totalDays,
  }) async {
    final cleanPhone = studentPhone.replaceAll(RegExp(r'\D'), '');
    final formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : '91$cleanPhone';

    final text = '🎉 *Course Registration Confirmed!* 🎓\n\n'
        'Hello *$studentName*,\n'
        'Welcome to *$courseTitle* on SuprO TeachO!\n\n'
        '📅 *Program Duration:* $totalDays Structured Daily Steps\n'
        '⏰ *Daily Study Routine:* 4 micro-lessons (~80 mins/day)\n'
        '🤖 *AI Tutor & TestO Exam Engine:* Activated for your number.\n\n'
        'Open your daily routine: https://supro.poovisri.com/teacho\n'
        'Happy Learning! 🌟';

    final uri = Uri.parse('https://wa.me/$formattedPhone?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
