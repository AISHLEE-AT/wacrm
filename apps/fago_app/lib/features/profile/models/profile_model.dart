class ProfileModel {
  final String id;
  final String fullName;
  final String role;
  final String? whatsapp;
  final String? digitalIdHash;
  final String? resumeUrl;
  final String? avatarUrl;
  final String? address;
  final Map<String, dynamic> resumeData;
  final List<dynamic> skills;
  final List<dynamic> education;
  final List<dynamic> experience;
  final String? upiId;

  ProfileModel({
    required this.id,
    required this.fullName,
    required this.role,
    this.whatsapp,
    this.digitalIdHash,
    this.resumeUrl,
    this.avatarUrl,
    this.address,
    this.resumeData = const {},
    this.skills = const [],
    this.education = const [],
    this.experience = const [],
    this.upiId,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'],
      fullName: json['full_name'] ?? 'User',
      role: json['role'] ?? 'User',
      whatsapp: json['whatsapp'],
      digitalIdHash: json['digital_id_hash'],
      resumeUrl: json['resume_url'],
      avatarUrl: json['avatar_url'],
      address: json['address'],
      resumeData: json['resume_data'] ?? {},
      skills: json['skills'] ?? [],
      education: json['education'] ?? [],
      experience: json['experience'] ?? [],
      upiId: json['upi_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'role': role,
      'whatsapp': whatsapp,
      'digital_id_hash': digitalIdHash,
      'resume_url': resumeUrl,
      'avatar_url': avatarUrl,
      'address': address,
      'resume_data': resumeData,
      'skills': skills,
      'education': education,
      'experience': experience,
      'upi_id': upiId,
    };
  }
}

class TransactionModel {
  final String id;
  final String userId;
  final String type;
  final double amount;
  final String? description;
  final String? referenceModule;
  final String? referenceId;
  final String status;
  final DateTime createdAt;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    this.description,
    this.referenceModule,
    this.referenceId,
    required this.status,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'],
      userId: json['user_id'],
      type: json['type'],
      amount: (json['amount'] ?? 0).toDouble(),
      description: json['description'],
      referenceModule: json['reference_module'],
      referenceId: json['reference_id'],
      status: json['status'] ?? 'COMPLETED',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class OrderModel {
  final String id;
  final String userId;
  final String itemId;
  final String itemType;
  final String paymentId;
  final String status;
  final double amount;
  final DateTime createdAt;

  OrderModel({
    required this.id,
    required this.userId,
    required this.itemId,
    required this.itemType,
    required this.paymentId,
    required this.status,
    required this.amount,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      userId: json['user_id'],
      itemId: json['item_id'],
      itemType: json['item_type'],
      paymentId: json['payment_id'],
      status: json['status'] ?? 'PENDING',
      amount: (json['amount'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
