import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../services/moneyo_providers.dart';
import 'widgets/savings_card.dart';

class MoneyODashboard extends ConsumerWidget {
  const MoneyODashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savingsAsyncValue = ref.watch(moneyoProvider);
    final totalSavingsAsyncValue = ref.watch(totalSavingsProvider);
    final currencyFormatter = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF0A0A0F),
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              title: totalSavingsAsyncValue.when(
                data: (total) => Text(
                  currencyFormatter.format(total),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 32,
                    letterSpacing: -1,
                  ),
                ),
                loading: () => const Text('...', style: TextStyle(color: Colors.white)),
                error: (_, __) => const Text('Error', style: TextStyle(color: Colors.red)),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF10B981).withOpacity(0.15),
                      Colors.transparent,
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: const Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: EdgeInsets.only(left: 24, bottom: 60),
                    child: Text(
                      'Total Savings',
                      style: TextStyle(color: Colors.white54, fontSize: 16),
                    ),
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
                icon: const Icon(Icons.add_circle_outline, color: Colors.white),
                onPressed: () {},
              ),
              const SizedBox(width: 8),
            ],
          ),
          savingsAsyncValue.when(
            data: (savings) {
              if (savings.isEmpty) {
                return const SliverFillRemaining(
                  child: Center(
                    child: Text(
                      'No active savings schemes.',
                      style: TextStyle(color: Colors.white54, fontSize: 16),
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => SavingsCard(savingsModel: savings[index]),
                    childCount: savings.length,
                  ),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
            ),
            error: (error, stack) => SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load savings\n$error',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ref.refresh(moneyoProvider);
                        ref.refresh(totalSavingsProvider);
                      },
                      child: const Text('Retry'),
                    )
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
