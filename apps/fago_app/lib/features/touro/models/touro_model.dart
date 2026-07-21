class TouroModel {
  final int id;
  final String userId;
  final String tourName;
  final Map<String, dynamic>? bookingDetails;
  final String status;
  final DateTime createdAt;

  TouroModel({
    required this.id,
    required this.userId,
    required this.tourName,
    this.bookingDetails,
    required this.status,
    required this.createdAt,
  });

  factory TouroModel.fromJson(Map<String, dynamic> json) {
    return TouroModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      userId: json['user_id'],
      tourName: json['tour_name'],
      bookingDetails: json['booking_details'],
      status: json['status'] ?? 'PENDING',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'tour_name': tourName,
      'booking_details': bookingDetails,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
