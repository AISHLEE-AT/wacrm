import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/tvo_model.dart';
import 'package:intl/intl.dart';

class VideoCard extends StatelessWidget {
  final TvoModel videoModel;

  const VideoCard({super.key, required this.videoModel});

  String get _thumbnail {
    if (videoModel.thumbnailUrl != null && videoModel.thumbnailUrl!.isNotEmpty) {
      if (!videoModel.thumbnailUrl!.contains('youtube.com/watch') && !videoModel.thumbnailUrl!.contains('youtu.be/')) {
        return videoModel.thumbnailUrl!;
      }
    }
    
    final url = videoModel.videoUrl;
    if (url.contains('v=')) {
      final videoId = url.split('v=')[1].split('&')[0];
      return 'https://img.youtube.com/vi/$videoId/0.jpg';
    } else if (url.contains('youtu.be/')) {
      final videoId = url.split('youtu.be/')[1].split('?')[0];
      return 'https://img.youtube.com/vi/$videoId/0.jpg';
    }
    return '';
  }

  void _launchVideo() async {
    final uri = Uri.parse(videoModel.videoUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final thumb = _thumbnail;
    
    return GestureDetector(
      onTap: _launchVideo,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Stack(
                children: [
                  if (thumb.isNotEmpty)
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(
                          thumb,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Icon(Icons.broken_image_rounded, size: 48, color: Colors.white24),
                          ),
                        ),
                      ),
                    )
                  else
                    const Center(
                      child: Icon(Icons.play_circle_fill_rounded, size: 64, color: Color(0xFFEF4444)),
                    ),
                  Positioned.fill(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 40),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'WATCH', 
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: Color(0xFF16161E),
                  child: Icon(Icons.person_rounded, color: Colors.white70),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        videoModel.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Creator • ${NumberFormat.compact().format(videoModel.viewsCount)} views • ${DateFormat.yMMMd().format(videoModel.createdAt)}',
                        style: const TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white54),
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
