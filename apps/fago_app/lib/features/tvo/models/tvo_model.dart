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
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      creatorId: json['creator_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      videoUrl: json['video_url']?.toString() ?? '',
      thumbnailUrl: json['thumbnail_url']?.toString(),
      viewsCount: json['views_count'] is int 
          ? json['views_count'] 
          : int.tryParse(json['views_count']?.toString() ?? '0') ?? 0,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
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
