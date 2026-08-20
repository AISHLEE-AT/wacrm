import 'courses_catalog.dart';

class DailyPlan {
  final int day;
  final int totalMinutes;
  final String phaseTitle;
  final List<TeachoTask> tasks;

  const DailyPlan({
    required this.day,
    required this.totalMinutes,
    required this.phaseTitle,
    required this.tasks,
  });
}

DailyPlan resolveMasterCurriculumPlan(TeachoCourse course, int dayNumber) {
  final int totalDays = course.totalDays > 0 ? course.totalDays : 200;
  final int safeDay = dayNumber.clamp(1, totalDays);

  final List<TeachoTask> baseTasks = course.tasks;
  if (baseTasks.isEmpty) {
    return DailyPlan(
      day: safeDay,
      totalMinutes: 45,
      phaseTitle: course.phaseTitle.isNotEmpty ? course.phaseTitle : 'Foundation Phase',
      tasks: [
        TeachoTask(
          id: '${course.id}_d${safeDay}_t1',
          title: '${course.short} Day $safeDay Core Mastery',
          duration: '25 Min',
          type: 'video',
          icon: '📖',
          rawSubject: course.subjects.isNotEmpty ? course.subjects.first.name : 'Core',
          rawTopic: 'Day $safeDay Fundamental Concepts',
        ),
        TeachoTask(
          id: '${course.id}_d${safeDay}_t2',
          title: 'Daily Practice Quiz (DPQ)',
          duration: '15 Min',
          type: 'practice',
          icon: '📝',
          rawSubject: 'DPQ Assessment',
          rawTopic: 'Daily Practice Questions & Solutions',
        ),
      ],
    );
  }

  // Derive day-specific tasks by cycling base curriculum
  final int taskCount = baseTasks.length;
  final int taskIndex = (safeDay - 1) % taskCount;
  final TeachoTask primaryTask = baseTasks[taskIndex];

  final List<TeachoTask> dayTasks = [
    TeachoTask(
      id: '${course.id}_d${safeDay}_primary',
      title: primaryTask.title,
      duration: primaryTask.duration,
      type: primaryTask.type,
      icon: primaryTask.icon,
      rawSubject: primaryTask.rawSubject.isNotEmpty ? primaryTask.rawSubject : (course.subjects.isNotEmpty ? course.subjects[0].name : 'Core'),
      rawTopic: primaryTask.rawTopic.isNotEmpty ? primaryTask.rawTopic : primaryTask.title,
    ),
    TeachoTask(
      id: '${course.id}_d${safeDay}_dpq',
      title: 'Daily Practice Quiz (DPQ): ${primaryTask.rawSubject.isNotEmpty ? primaryTask.rawSubject : "Core"}',
      duration: '15 Min',
      type: 'practice',
      icon: '📝',
      rawSubject: 'DPQ Test',
      rawTopic: '4 High-Yield MCQs with step-by-step solutions',
    ),
    TeachoTask(
      id: '${course.id}_d${safeDay}_recap',
      title: '1-Minute Bedtime & Parent Recap',
      duration: '5 Min',
      type: 'reading',
      icon: '🌙',
      rawSubject: 'Revision',
      rawTopic: 'Daily Parent Summary & Student Concept Retention',
    ),
  ];

  int totalMins = 0;
  for (final t in dayTasks) {
    final match = RegExp(r'(\d+)').firstMatch(t.duration);
    totalMins += match != null ? int.parse(match.group(1)!) : 20;
  }

  return DailyPlan(
    day: safeDay,
    totalMinutes: totalMins > 0 ? totalMins : 45,
    phaseTitle: course.phaseTitle.isNotEmpty ? course.phaseTitle : 'Academic Progression',
    tasks: dayTasks,
  );
}
