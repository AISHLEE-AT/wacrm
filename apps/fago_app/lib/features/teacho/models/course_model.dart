class CourseModel {
  final int id;
  final String? adminId;
  final String title;
  final String? content;
  final String type;
  final String? classLevel;
  final String? language;
  final double price;
  final List<dynamic> curriculum;
  final DateTime createdAt;

  CourseModel({
    required this.id,
    this.adminId,
    required this.title,
    this.content,
    required this.type,
    this.classLevel,
    this.language,
    required this.price,
    required this.curriculum,
    required this.createdAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      adminId: json['admin_id'] as String?,
      title: json['title'] as String,
      content: json['content'] as String?,
      type: json['type'] as String? ?? 'Course',
      classLevel: json['class_level'] as String?,
      language: json['language'] as String?,
      price: (json['price'] ?? 0).toDouble(),
      curriculum: json['curriculum'] ?? [],
      createdAt: json['created_at'] != null 
        ? DateTime.parse(json['created_at'])
        : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'admin_id': adminId,
      'title': title,
      'content': content,
      'type': type,
      'class_level': classLevel,
      'language': language,
      'price': price,
      'curriculum': curriculum,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
