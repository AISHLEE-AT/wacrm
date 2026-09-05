import 'package:flutter_test/flutter_test.dart';
import 'package:supro_flutter/features/teacho/data/curriculum365_engine.dart';
import 'package:supro_flutter/features/teacho/data/whole_year_day_plan_engine.dart';
import 'package:supro_flutter/features/teacho/services/tuto_oci_service.dart';

void main() {
  test('TutO 365 Curriculum Engine generates 10 unique classes', () {
    final day1 = generateUniqueTenClassesForDay('school-std-10', 'jr-ias', 1);
    expect(day1.classes.length, 10);
    expect(day1.yoga.name, 'Vrikshasana (Tree Pose)');
    expect(day1.dailyTest.questions.length, 5);
    expect(day1.classes[7].subject, 'JrIAS Track');
  });

  test('TutO LKG Curriculum includes phonics, number magic and ambition', () {
    final lkg = generateUniqueTenClassesForDay('school-lkg', 'jr-scientist', 50);
    expect(lkg.classes.length, 10);
    expect(lkg.classes[0].title.contains('Phonics'), isTrue);
    expect(lkg.classes[1].title.contains('Number Magic'), isTrue);
    expect(lkg.classes[7].title.contains('JrScientist'), isTrue);
  });

  test('Whole year engine produces authentic day summaries & Monday holidays', () {
    final summaries = getAllDaySummariesForCourse(
      courseId: 'school-std-10',
      courseTitle: 'Class 10th',
      totalDays: 14,
    );
    expect(summaries.length, 14);
    expect(summaries[0].isMondayHoliday, isTrue);
    expect(summaries[1].isMondayHoliday, isFalse);
  });

  test('TutoOciService is configured for 100% OCI backend', () {
    expect(TutoOciService.baseUrl, 'https://mysupro.duckdns.org');
  });
}
