class MoneyoModel {
  final int id;
  final String userId;
  final String schemeName;
  final double amount;
  final String status;
  final DateTime createdAt;

  MoneyoModel({
    required this.id,
    required this.userId,
    required this.schemeName,
    required this.amount,
    required this.status,
    required this.createdAt,
  });

  factory MoneyoModel.fromJson(Map<String, dynamic> json) {
    return MoneyoModel(
      id: json['id'],
      userId: json['user_id'],
      schemeName: json['scheme_name'],
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] ?? 'ACTIVE',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'scheme_name': schemeName,
      'amount': amount,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
