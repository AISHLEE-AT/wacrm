class TransactionModel {
  final String id;
  final String userId;
  final double amount;
  final String type; // 'CREDIT' or 'DEBIT'
  final String? description;
  final String referenceModule;
  final DateTime createdAt;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.amount,
    required this.type,
    this.description,
    required this.referenceModule,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'],
      userId: json['user_id'],
      amount: (json['amount'] as num).toDouble(),
      type: json['type'],
      description: json['description'],
      referenceModule: json['reference_module'] ?? 'Unknown',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
