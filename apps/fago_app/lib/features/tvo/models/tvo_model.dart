class TvoModel {
  final int id;
  final String creatorId;
  final String title;
  final String? description;
  final String videoUrl;
  final String? thumbnailUrl;
  final int viewsCount;
  final DateTime createdAt;

  TvoModel({
    required this.id,
    required this.creatorId,
    required this.title,
    this.description,
    required this.videoUrl,
    this.thumbnailUrl,
    required this.viewsCount,
    required this.createdAt,
  });

  factory TvoModel.fromJson(Map<String, dynamic> json) {
    return TvoModel(
      id: json['id'],
      creatorId: json['creator_id'],
      title: json['title'],
      description: json['description'],
      videoUrl: json['video_url'],
      thumbnailUrl: json['thumbnail_url'],
      viewsCount: json['views_count'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'creator_id': creatorId,
      'title': title,
      'description': description,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'views_count': viewsCount,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
