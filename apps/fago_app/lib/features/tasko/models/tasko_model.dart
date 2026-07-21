class TaskoModel {
  final int id;
  final String userId;
  final String title;
  final String status;
  final DateTime? dueDate;
  final DateTime createdAt;

  TaskoModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.status,
    this.dueDate,
    required this.createdAt,
  });

  factory TaskoModel.fromJson(Map<String, dynamic> json) {
    return TaskoModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      userId: json['user_id'],
      title: json['title'],
      status: json['status'] ?? 'TODO',
      dueDate: json['due_date'] != null ? DateTime.parse(json['due_date']) : null,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'status': status,
      'due_date': dueDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
