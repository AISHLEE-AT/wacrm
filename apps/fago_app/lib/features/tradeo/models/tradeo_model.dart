class TradeoModel {
  final int id;
  final String sellerId;
  final String title;
  final String? description;
  final double price;
  final String status;
  final DateTime createdAt;

  TradeoModel({
    required this.id,
    required this.sellerId,
    required this.title,
    this.description,
    required this.price,
    required this.status,
    required this.createdAt,
  });

  factory TradeoModel.fromJson(Map<String, dynamic> json) {
    return TradeoModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      sellerId: json['seller_id'],
      title: json['title'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      status: json['status'] ?? 'AVAILABLE',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'seller_id': sellerId,
      'title': title,
      'description': description,
      'price': price,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
