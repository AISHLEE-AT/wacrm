import 'package:flutter/material.dart';
import '../../models/tvo_model.dart';
import 'package:intl/intl.dart';

class VideoCard extends StatelessWidget {
  final TvoModel videoModel;

  const VideoCard({super.key, required this.videoModel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444).withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Stack(
              children: [
                if (videoModel.thumbnailUrl != null)
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        videoModel.thumbnailUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(Icons.broken_image_rounded, size: 48, color: Colors.white24),
                        ),
                      ),
                    ),
                  )
                else
                  const Center(
                    child: Icon(Icons.play_circle_fill_rounded, size: 64, color: Color(0xFFEF4444)),
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
                      '10:00', // Placeholder duration
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
    );
  }
}
