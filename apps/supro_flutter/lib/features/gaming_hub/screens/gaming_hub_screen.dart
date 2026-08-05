import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../services/offline_sync_service.dart';
import '../../../services/rewards_service.dart';
import '../games/mythic_quest_screen.dart';
import '../games/vocab_builder_screen.dart';
import '../games/agri_scholar_screen.dart';
import '../games/jal_tantra_screen.dart';
import 'rewards_screen.dart';

class GamingHubScreen extends StatefulWidget {
  const GamingHubScreen({super.key});

  @override
  State<GamingHubScreen> createState() => _GamingHubScreenState();
}

class _GamingHubScreenState extends State<GamingHubScreen> {
  int _offlineTesto = 0;
  int _offlineFarm = 0;
  UserBalance _liveBalance = const UserBalance(testoPoints: 0, farmPoints: 0);
  bool _isSyncing = false;

  // User ID from main Supabase auth session — stored as TEXT in Gameo DB
  String? get _userId => Supabase.instance.client.auth.currentUser?.id;
  bool get _isLoggedIn => _userId != null;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!_isLoggedIn) return;
    final testo = await OfflineSyncService.getOfflineTestoPoints();
    final farm = await OfflineSyncService.getOfflineFarmPoints();
    final live = await RewardsService.getUserBalance(_userId!);
    if (mounted) {
      setState(() {
        _offlineTesto = testo;
        _offlineFarm = farm;
        _liveBalance = live;
      });
    }
  }

  bool get _hasOfflinePoints => _offlineTesto > 0 || _offlineFarm > 0;

  Future<void> _syncPoints() async {
    if (!_isLoggedIn || !_hasOfflinePoints) return;
    setState(() => _isSyncing = true);

    final success = await OfflineSyncService.syncPointsToServer(_userId!);

    setState(() => _isSyncing = false);

    if (success) {
      await _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All offline points synced to your wallet!'),
            backgroundColor: Color(0xFFF59E0B),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sync failed. Check your internet connection.'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _openRewards() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const RewardsScreen()),
    ).then((_) => _loadData()); // Refresh on return
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E293B),
      appBar: AppBar(
        title: const Text('Rural Gaming Hub',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          // Wallet button
          GestureDetector(
            onTap: _openRewards,
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(LucideIcons.trophy, size: 16, color: Colors.white),
                  SizedBox(width: 6),
                  Text('My Wallet',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: Colors.amber,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Live Balance Row
                Row(
                  children: [
                    Expanded(
                      child: _MiniBalanceCard(
                        label: 'Testo Credits',
                        live: _liveBalance.testoPoints,
                        offline: _offlineTesto,
                        color: const Color(0xFF8B5CF6),
                        icon: '🎓',
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _MiniBalanceCard(
                        label: 'Farm Points',
                        live: _liveBalance.farmPoints,
                        offline: _offlineFarm,
                        color: const Color(0xFF10B981),
                        icon: '🌾',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Sync banner (only if offline points exist)
                if (_hasOfflinePoints) ...[
                  _buildSyncBanner(),
                  const SizedBox(height: 16),
                ],

                // Redeem CTA
                GestureDetector(
                  onTap: _openRewards,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.gift, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Redeem Points for Rewards & Coupons 🎁',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 28),
                const Text('🎓 Student Zone',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Earns Testo Credits',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5), fontSize: 13)),
                const SizedBox(height: 14),
                _buildGameCard(
                  title: 'Mythic Village Quest',
                  subtitle: 'RPG adventure with Science & History puzzles. +50 pts/level',
                  icon: LucideIcons.sword,
                  color: const Color(0xFF8B5CF6),
                  onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const MythicQuestScreen()))
                      .then((_) => _loadData()),
                ),
                const SizedBox(height: 12),
                _buildGameCard(
                  title: 'Vocab-Builder',
                  subtitle: 'Connect words to build structures. +10 pts/word',
                  icon: LucideIcons.bookA,
                  color: const Color(0xFF3B82F6),
                  onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const VocabBuilderScreen()))
                      .then((_) => _loadData()),
                ),

                const SizedBox(height: 28),
                const Text('🚜 Village Zone',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Earns Farm Input Discounts',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5), fontSize: 13)),
                const SizedBox(height: 14),
                _buildGameCard(
                  title: 'Agri-Scholar Simulator',
                  subtitle: 'Grow crops by answering farming trivia. +100 pts/harvest',
                  icon: LucideIcons.sprout,
                  color: const Color(0xFF10B981),
                  onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const AgriScholarScreen()))
                      .then((_) => _loadData()),
                ),
                const SizedBox(height: 12),
                _buildGameCard(
                  title: 'Jal-Tantra',
                  subtitle: 'Zen water routing puzzles. +20 pts/puzzle solved',
                  icon: LucideIcons.droplets,
                  color: const Color(0xFF06B6D4),
                  onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const JalTantraScreen()))
                      .then((_) => _loadData()),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSyncBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
        border: Border.all(color: const Color(0xFFF59E0B)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.cloudUpload,
              color: Color(0xFFF59E0B), size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Offline Points Pending',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold)),
                Text(
                    '$_offlineTesto Testo + $_offlineFarm Farm pts to sync',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6), fontSize: 12)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: _isSyncing ? null : _syncPoints,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18)),
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            ),
            child: _isSyncing
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Text('Sync',
                    style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  Widget _buildGameCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF334155),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12)),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, color: Colors.white54),
          ],
        ),
      ),
    );
  }
}

// Mini balance card widget for the hub
class _MiniBalanceCard extends StatelessWidget {
  final String label;
  final int live;
  final int offline;
  final Color color;
  final String icon;

  const _MiniBalanceCard({
    required this.label,
    required this.live,
    required this.offline,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 6),
          Text('$live',
              style: TextStyle(
                  color: color,
                  fontSize: 24,
                  fontWeight: FontWeight.w900)),
          Text(label,
              style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6), fontSize: 11)),
          if (offline > 0)
            Text('+$offline offline',
                style: const TextStyle(
                    color: Colors.amber, fontSize: 11)),
        ],
      ),
    );
  }
}