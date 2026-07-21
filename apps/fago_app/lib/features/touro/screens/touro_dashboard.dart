import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/touro_providers.dart';
import 'widgets/tour_card.dart';

class TourODashboard extends ConsumerWidget {
  const TourODashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toursAsyncValue = ref.watch(touroProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: toursAsyncValue.when(
        data: (tours) {
          if (tours.isEmpty) {
            return const Center(
              child: Text(
                'No tours available right now.',
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(touroProvider.future),
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
                      'TourO',
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
                            const Color(0xFF3B82F6).withOpacity(0.15),
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
                      icon: const Icon(Icons.search, color: Colors.white),
                      onPressed: () {},
                    ),
                    const SizedBox(width: 8),
                  ],
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => TourCard(touroModel: tours[index]),
                      childCount: tours.length,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6))),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                'Failed to load tours\n$error',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(touroProvider),
                child: const Text('Retry'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
