import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'curriculum365_engine.dart';

export 'curriculum365_engine.dart';

class DayPlanSummaryItem {
  final int dayNumber;
  final int weekNumber;
  final String dayOfWeekName;
  final bool isMondayHoliday;
  final String subject;
  final String subjectCode;
  final String chapterTitle;
  final String topicTitle;
  final String? topicTamilTitle;
  final String conceptCode;
  final int estimatedTotalMinutes;
  final int totalXpReward;
  final bool isCompleted;

  const DayPlanSummaryItem({
    required this.dayNumber,
    required this.weekNumber,
    required this.dayOfWeekName,
    required this.isMondayHoliday,
    required this.subject,
    required this.subjectCode,
    required this.chapterTitle,
    required this.topicTitle,
    this.topicTamilTitle,
    required this.conceptCode,
    required this.estimatedTotalMinutes,
    required this.totalXpReward,
    this.isCompleted = false,
  });

  DayPlanSummaryItem copyWith({bool? isCompleted}) {
    return DayPlanSummaryItem(
      dayNumber: dayNumber,
      weekNumber: weekNumber,
      dayOfWeekName: dayOfWeekName,
      isMondayHoliday: isMondayHoliday,
      subject: subject,
      subjectCode: subjectCode,
      chapterTitle: chapterTitle,
      topicTitle: topicTitle,
      topicTamilTitle: topicTamilTitle,
      conceptCode: conceptCode,
      estimatedTotalMinutes: estimatedTotalMinutes,
      totalXpReward: totalXpReward,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

/// Returns light-weight summary items for all 365 days of a course for fast list rendering.
List<DayPlanSummaryItem> getAllDaySummariesForCourse({
  required String courseId,
  required String courseTitle,
  int totalDays = 365,
  String schoolBoard = 'TNSB',
  Set<int> completedDaySet = const {},
}) {
  final List<DayPlanSummaryItem> days = [];
  final dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (int day = 1; day <= totalDays; day++) {
    final bool isMonday = (day % 7) == 1;
    final int weekNumber = ((day - 1) ~/ 7) + 1;
    final int dayIdx = (day - 1) % 7;
    final String dayOfWeekName = dayNames[dayIdx];

    // Generate deterministic topic from 365 engine
    final result = generateUniqueTenClassesForDay(courseId, 'jr-ias', day, schoolBoard);
    final firstClass = result.classes.isNotEmpty ? result.classes.first : null;

    days.push(
      DayPlanSummaryItem(
        dayNumber: day,
        weekNumber: weekNumber,
        dayOfWeekName: dayOfWeekName,
        isMondayHoliday: isMonday,
        subject: isMonday ? 'Mindful Rest & Weekly Review' : (firstClass?.subject ?? 'Core Academic'),
        subjectCode: isMonday ? 'REV' : 'COR',
        chapterTitle: isMonday ? 'Week $weekNumber Review' : result.term,
        topicTitle: isMonday ? '🌿 Week $weekNumber Review & Mindful Rest Day' : (firstClass?.title ?? 'Day $day Lesson'),
        topicTamilTitle: isMonday ? 'வாரம் $weekNumber மீள்பார்வை மற்றும் ஓய்வு நாள்' : firstClass?.tamilTitle,
        conceptCode: 'C-${day.toString().padLeft(3, '0')}',
        estimatedTotalMinutes: isMonday ? 20 : 65,
        totalXpReward: isMonday ? 50 : 150,
        isCompleted: completedDaySet.contains(day),
      ),
    );
  }

  return days;
}

extension _ListPush<T> on List<T> {
  void push(T val) => add(val);
}

// ─── Completion Storage Helpers ───
const String _completedDaysPrefix = 'tuto_completed_days_';

Future<Set<int>> getCompletedDaysForCourse(String courseId) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_completedDaysPrefix$courseId');
    if (raw == null || raw.isEmpty) return {};
    final list = jsonDecode(raw) as List;
    return list.map((e) => int.parse(e.toString())).toSet();
  } catch (e) {
    return {};
  }
}

Future<bool> toggleDayCompletion(String courseId, int dayNumber) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final set = await getCompletedDaysForCourse(courseId);
    final bool isNowCompleted = !set.contains(dayNumber);
    if (isNowCompleted) {
      set.add(dayNumber);
    } else {
      set.remove(dayNumber);
    }
    await prefs.setString('$_completedDaysPrefix$courseId', jsonEncode(set.toList()));
    return isNowCompleted;
  } catch (e) {
    return false;
  }
}

Future<int> getMaxUnlockedDay(String courseId) async {
  final completedDays = await getCompletedDaysForCourse(courseId);
  int maxDay = 1;
  while (completedDays.contains(maxDay)) {
    maxDay++;
  }
  return maxDay;
}

// ─── Admin Released Days Management ───
const String _adminReleasedDaysPrefix = 'tuto_admin_released_days_v1_';

Future<Set<int>> getAdminReleasedDayNumbers(String courseId) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_adminReleasedDaysPrefix$courseId');
    if (raw != null && raw.isNotEmpty) {
      final list = jsonDecode(raw) as List;
      return list.map((e) => int.parse(e.toString())).toSet();
    }
    // Default starter: Days 1 to 14
    final starter = List.generate(14, (i) => i + 1).toSet();
    await prefs.setString('$_adminReleasedDaysPrefix$courseId', jsonEncode(starter.toList()));
    return starter;
  } catch (e) {
    return List.generate(14, (i) => i + 1).toSet();
  }
}

Future<bool> toggleAdminDayRelease(String courseId, int dayNumber) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final set = await getAdminReleasedDayNumbers(courseId);
    final isNowReleased = !set.contains(dayNumber);
    if (isNowReleased) {
      set.add(dayNumber);
    } else {
      set.remove(dayNumber);
    }
    await prefs.setString('$_adminReleasedDaysPrefix$courseId', jsonEncode(set.toList()));
    return isNowReleased;
  } catch (e) {
    return false;
  }
}

Future<List<int>> releaseBatchDays(String courseId, int fromDay, int toDay) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final set = await getAdminReleasedDayNumbers(courseId);
    for (int d = fromDay; d <= toDay; d++) {
      set.add(d);
    }
    final sorted = set.toList()..sort();
    await prefs.setString('$_adminReleasedDaysPrefix$courseId', jsonEncode(sorted));
    return sorted;
  } catch (e) {
    return [];
  }
}

Future<List<DayPlanSummaryItem>> getReleasedDaySummariesForCourse({
  required String courseId,
  required String courseTitle,
  String schoolBoard = 'TNSB',
  Set<int> completedDaySet = const {},
}) async {
  final releasedSet = await getAdminReleasedDayNumbers(courseId);
  final allDays = getAllDaySummariesForCourse(
    courseId: courseId,
    courseTitle: courseTitle,
    totalDays: 365,
    schoolBoard: schoolBoard,
    completedDaySet: completedDaySet,
  );
  return allDays.where((d) => releasedSet.contains(d.dayNumber)).toList();
}
