import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/testo_providers.dart';
import 'widgets/test_card.dart';

class TestODashboard extends ConsumerWidget {
  const TestODashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final testsAsyncValue = ref.watch(testoTestsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: testsAsyncValue.when(
        data: (tests) {
          if (tests.isEmpty) {
            return const Center(
              child: Text(
                'No assessments available right now.',
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(testoTestsProvider.future),
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
                      'TestO',
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
                            const Color(0xFFEF4444).withOpacity(0.15),
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
                      (context, index) => TestCard(testModel: tests[index]),
                      childCount: tests.length,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFEF4444))),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                'Failed to load tests\n$error',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(testoTestsProvider),
                child: const Text('Retry'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
