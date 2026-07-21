class TestoTest {
  final int id;
  final String title;
  final String? description;
  final int timeLimitMinutes;
  final int passingScore;

  TestoTest({
    required this.id,
    required this.title,
    this.description,
    required this.timeLimitMinutes,
    required this.passingScore,
  });

  factory TestoTest.fromJson(Map<String, dynamic> json) {
    return TestoTest(
      id: json['id'],
      title: json['title'] ?? 'Untitled Test',
      description: json['description'],
      timeLimitMinutes: json['time_limit_minutes'] ?? 30,
      passingScore: json['passing_score'] ?? 50,
    );
  }
}
