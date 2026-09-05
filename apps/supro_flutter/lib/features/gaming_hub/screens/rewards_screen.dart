import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../services/rewards_service.dart';
import '../../../core/env.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  UserBalance _balance = const UserBalance(testoPoints: 0, farmPoints: 0);
  List<GameCoupon> _coupons = [];
  bool _isLoading = true;
  String? _redeemingId;

  String? _userId;
  bool get _isLoggedIn => _userId != null && _userId!.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final phone = prefs.getString('user_phone');
    _userId = prefs.getString('user_id') ?? (phone != null ? 'user_$phone' : 'demo_user');
    setState(() => _isLoading = true);
    final balance = await RewardsService.getUserBalance(_userId!);
    final coupons = await RewardsService.getUserCoupons(_userId!);
    setState(() {
      _balance = balance;
      _coupons = coupons;
      _isLoading = false;
    });
  }

  Future<void> _redeem(RewardTier reward) async {
    // Check sufficient balance
    final currentBalance =
        reward.rewardType == 'testo' ? _balance.testoPoints : _balance.farmPoints;
    if (currentBalance < reward.pointsCost) {
      _showErrorSnack('Not enough points! Play more games to earn points.');
      return;
    }

    // Confirm dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _buildConfirmDialog(reward, currentBalance),
    );
    if (confirmed != true) return;

    setState(() => _redeemingId = reward.id);
    final couponCode = await RewardsService.redeemReward(
      userId: _userId!,
      reward: reward,
    );
    setState(() => _redeemingId = null);

    if (couponCode != null) {
      await _loadData(); // Refresh balance + coupons
      if (mounted) _showCouponSuccess(couponCode, reward);
    } else {
      _showErrorSnack('Redemption failed. Please try again.');
    }
  }

  void _showErrorSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showCouponSuccess(String code, RewardTier reward) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CouponSuccessSheet(code: code, reward: reward),
    );
  }

  Widget _buildConfirmDialog(RewardTier reward, int currentBalance) {
    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(reward.icon, style: const TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            Text(
              reward.title,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Spend ${reward.pointsCost} pts from your ${reward.rewardType == 'testo' ? 'Testo Credits' : 'Farm Points'}?',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Balance after: ${currentBalance - reward.pointsCost} pts',
              style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white24),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(reward.color),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Redeem!'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text(
          '🏆 My Rewards Wallet',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Colors.white70),
            onPressed: _loadData,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.amber,
          labelColor: Colors.amber,
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'My Balance'),
            Tab(text: 'Student'),
            Tab(text: 'Farmer'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.amber))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildBalanceTab(),
                _buildRewardsTab(
                    RewardsService.studentRewards, 'testo'),
                _buildRewardsTab(
                    RewardsService.farmerRewards, 'farm'),
              ],
            ),
    );
  }

  Widget _buildBalanceTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: Colors.amber,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Balance Cards
          Row(
            children: [
              Expanded(
                child: _BalanceCard(
                  title: 'Testo Credits',
                  points: _balance.testoPoints,
                  icon: '🎓',
                  gradient: const [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _BalanceCard(
                  title: 'Farm Points',
                  points: _balance.farmPoints,
                  icon: '🌾',
                  gradient: const [Color(0xFF10B981), Color(0xFF059669)],
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),
          const Text(
            'My Coupons',
            style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (_coupons.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text('🎫', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  Text(
                    'No coupons yet!\nPlay games and redeem rewards.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
                  ),
                ],
              ),
            )
          else
            ..._coupons.map((c) => _CouponCard(coupon: c)),
        ],
      ),
    );
  }

  Widget _buildRewardsTab(List<RewardTier> rewards, String pointType) {
    final balance = pointType == 'testo'
        ? _balance.testoPoints
        : _balance.farmPoints;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Current balance chip
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Text(
                pointType == 'testo' ? '🎓' : '🌾',
                style: const TextStyle(fontSize: 20),
              ),
              const SizedBox(width: 8),
              Text(
                'Your Balance: ',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
              ),
              Text(
                '$balance pts',
                style: const TextStyle(
                    color: Colors.amber,
                    fontWeight: FontWeight.bold,
                    fontSize: 18),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ...rewards.map((reward) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _RewardCard(
                reward: reward,
                userBalance: balance,
                isRedeeming: _redeemingId == reward.id,
                onRedeem: () => _redeem(reward),
              ),
            )),
      ],
    );
  }
}

// ── Sub-widgets ──────────────────────────────────────────────────────────────

class _BalanceCard extends StatelessWidget {
  final String title;
  final int points;
  final String icon;
  final List<Color> gradient;
  const _BalanceCard(
      {required this.title,
      required this.points,
      required this.icon,
      required this.gradient});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
            colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: gradient.first.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 32)),
          const SizedBox(height: 12),
          Text(
            '$points',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.w900),
          ),
          Text(
            title,
            style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _RewardCard extends StatelessWidget {
  final RewardTier reward;
  final int userBalance;
  final bool isRedeeming;
  final VoidCallback onRedeem;
  const _RewardCard(
      {required this.reward,
      required this.userBalance,
      required this.isRedeeming,
      required this.onRedeem});

  @override
  Widget build(BuildContext context) {
    final canAfford = userBalance >= reward.pointsCost;
    final color = Color(reward.color);
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: canAfford ? color.withValues(alpha: 0.5) : Colors.white12,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(reward.icon,
                    style: const TextStyle(fontSize: 28)),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    reward.title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    reward.description,
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6), fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${reward.pointsCost} pts',
                          style: TextStyle(
                              color: color,
                              fontWeight: FontWeight.bold,
                              fontSize: 12),
                        ),
                      ),
                      if (!canAfford) ...[
                        const SizedBox(width: 8),
                        Text(
                          'Need ${reward.pointsCost - userBalance} more',
                          style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.4),
                              fontSize: 11),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 80,
              child: ElevatedButton(
                onPressed: (canAfford && !isRedeeming) ? onRedeem : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  disabledBackgroundColor: Colors.white12,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: isRedeeming
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : const Text('Redeem',
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CouponCard extends StatelessWidget {
  final GameCoupon coupon;
  const _CouponCard({required this.coupon});

  @override
  Widget build(BuildContext context) {
    final isTesto = coupon.rewardType == 'testo';
    final color = isTesto ? const Color(0xFF8B5CF6) : const Color(0xFF10B981);

    void copyCode() {
      Clipboard.setData(ClipboardData(text: coupon.couponCode));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Coupon code copied!'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    void openPortal() async {
      final uri = Uri.parse(RewardsService.getPortalDeepLink(coupon));
      if (await canLaunchUrl(uri)) await launchUrl(uri);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: coupon.isRedeemed ? Colors.white12 : color.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(isTesto ? '🎓' : '🌾',
                    style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 8),
                Text(
                  isTesto ? 'Testo Reward' : 'Farm Reward',
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                if (coupon.isRedeemed)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                        color: Colors.white12,
                        borderRadius: BorderRadius.circular(8)),
                    child: const Text('Used',
                        style:
                            TextStyle(color: Colors.white38, fontSize: 11)),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8)),
                    child: Text('Active',
                        style:
                            TextStyle(color: color, fontSize: 11)),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            // Coupon code box
            GestureDetector(
              onTap: copyCode,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: color.withValues(alpha: 0.3),
                      style: BorderStyle.solid),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        coupon.couponCode,
                        style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.w900,
                            fontSize: 18,
                            letterSpacing: 3),
                      ),
                    ),
                    Icon(LucideIcons.copy, color: color, size: 18),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Text(
                  '${coupon.pointsSpent} pts spent',
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4), fontSize: 12),
                ),
                const Spacer(),
                if (!coupon.isRedeemed)
                  TextButton.icon(
                    onPressed: openPortal,
                    icon: Icon(LucideIcons.externalLink,
                        size: 14, color: color),
                    label: Text('Use on Portal',
                        style: TextStyle(color: color, fontSize: 12)),
                    style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Coupon Success Bottom Sheet ───────────────────────────────────────────────

class _CouponSuccessSheet extends StatelessWidget {
  final String code;
  final RewardTier reward;
  const _CouponSuccessSheet({required this.code, required this.reward});

  @override
  Widget build(BuildContext context) {
    final color = Color(reward.color);

    void copyCode() {
      Clipboard.setData(ClipboardData(text: code));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Code copied to clipboard!'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    void openPortal() async {
      Navigator.pop(context);
      final uri = Uri.parse(
          '${AppEnv.crmUrl}/redeem?coupon=$code&type=${reward.rewardType}');
      if (await canLaunchUrl(uri)) await launchUrl(uri);
    }

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF1E293B),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text('🎉', style: const TextStyle(fontSize: 56)),
          const SizedBox(height: 12),
          const Text(
            'Reward Redeemed!',
            style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text(
            reward.title,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: copyCode,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [color.withValues(alpha: 0.2), color.withValues(alpha: 0.05)],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withValues(alpha: 0.5)),
              ),
              child: Column(
                children: [
                  Text(
                    'YOUR COUPON CODE',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 11,
                        letterSpacing: 2),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        code,
                        style: TextStyle(
                            color: color,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4),
                      ),
                      const SizedBox(width: 10),
                      Icon(LucideIcons.copy, color: color, size: 20),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Tap to copy',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4), fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: openPortal,
              icon: const Icon(LucideIcons.externalLink, size: 18),
              label: const Text('Use on SuprO Portal Now'),
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                textStyle: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close',
                style: TextStyle(color: Colors.white54)),
          ),
        ],
      ),
    );
  }
}
