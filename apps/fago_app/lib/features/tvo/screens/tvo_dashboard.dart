import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/tvo_providers.dart';
import 'widgets/video_card.dart';

class TvODashboard extends ConsumerWidget {
  const TvODashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final videosAsyncValue = ref.watch(tvoProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: videosAsyncValue.when(
        data: (videos) {
          if (videos.isEmpty) {
            return const Center(
              child: Text(
                'No videos available right now.',
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(tvoProvider.future),
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 120,
                  floating: true,
                  pinned: true,
                  backgroundColor: const Color(0xFF0A0A0F),
                  elevation: 0,
                  flexibleSpace: FlexibleSpaceBar(
                    titlePadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    title: const Text(
                      'TvO',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 28,
                        letterSpacing: -1,
                      ),
                    ),
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFFEF4444).withValues(alpha: 0.15),
                            Colors.transparent,
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.grid_view_rounded, color: Colors.white70),
                      tooltip: 'Switch Module',
                      onPressed: () {
                        context.go('/');
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.search_rounded, color: Colors.white),
                      onPressed: () {},
                    ),
                    const SizedBox(width: 8),
                  ],
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => VideoCard(videoModel: videos[index]),
                      childCount: videos.length,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => Column(
          children: [
            SafeArea(
              child: Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => context.go('/'),
                ),
              ),
            ),
            const Expanded(child: Center(child: CircularProgressIndicator(color: Color(0xFFEF4444)))),
          ],
        ),
        error: (error, stack) => Column(
          children: [
            SafeArea(
              child: Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => context.go('/'),
                ),
              ),
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load videos\n$error',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.refresh(tvoProvider),
                      child: const Text('Retry'),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
