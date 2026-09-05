import '../core/gameo_supabase.dart';
import '../core/env.dart';

/// Handles fetching balances and redeeming game rewards for portal coupons.
class RewardsService {
  // --- Reward Tiers ---
  static const List<RewardTier> studentRewards = [
    RewardTier(
      id: 'testo_mock_test',
      title: 'Testo Mock Test',
      description: '1 free full mock exam session on Testo',
      icon: '??',
      pointsCost: 100,
      rewardType: 'testo',
      color: 0xFF8B5CF6,
    ),
    RewardTier(
      id: 'testo_premium_week',
      title: 'Testo Premium (7 Days)',
      description: '7-day premium access to all study materials',
      icon: '??',
      pointsCost: 500,
      rewardType: 'testo',
      color: 0xFF6D28D9,
    ),
  ];

  static const List<RewardTier> farmerRewards = [
    RewardTier(
      id: 'farm_discount_10',
      title: '10% Farm Input Discount',
      description: '10% off your next portal farm input order',
      icon: '??',
      pointsCost: 200,
      rewardType: 'farm',
      color: 0xFF10B981,
    ),
    RewardTier(
      id: 'free_seed_pack',
      title: 'Free Seed Pack (?100)',
      description: '?100 seed voucher applied to your cart',
      icon: '??',
      pointsCost: 500,
      rewardType: 'farm',
      color: 0xFF059669,
    ),
  ];

  /// Fetches the user's live Testo Credits and Farm Points from Gameo DB.
  static Future<UserBalance> getUserBalance(String userId) async {
    try {
      final response = await GameOSupabase.client.rpc(
        'get_user_balance',
        params: {'p_user_id': userId},
      );
      if (response != null) {
        return UserBalance(
          testoPoints: (response['testo_points'] as num?)?.toInt() ?? 0,
          farmPoints: (response['farm_points'] as num?)?.toInt() ?? 0,
        );
      }
    } catch (e) {
      // ignore: avoid_print
      print('Balance fetch error: $e');
    }
    return UserBalance(testoPoints: 0, farmPoints: 0);
  }

  /// Redeems a reward and returns a unique coupon code.
  /// Returns null if the redemption fails (e.g., insufficient points).
  static Future<String?> redeemReward({
    required String userId,
    required RewardTier reward,
  }) async {
    try {
      final response = await GameOSupabase.client.rpc(
        'redeem_points',
        params: {
          'p_user_id': userId,
          'p_reward_id': reward.id,
          'p_reward_type': reward.rewardType,
          'p_points_cost': reward.pointsCost,
        },
      );
      if (response != null && response['success'] == true) {
        return response['coupon_code'] as String?;
      }
    } catch (e) {
      // ignore: avoid_print
      print('Redemption error: $e');
    }
    return null;
  }

  /// Fetches all previously generated coupons for this user.
  static Future<List<GameCoupon>> getUserCoupons(String userId) async {
    try {
      final response = await GameOSupabase.client
          .from('game_rewards')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(20);

      return (response as List)
          .map((row) => GameCoupon.fromJson(row))
          .toList();
    } catch (e) {
      // ignore: avoid_print
      print('Coupon fetch error: $e');
      return [];
    }
  }

  /// Generates the portal deep link URL for a coupon.
  static String getPortalDeepLink(GameCoupon coupon) {
    return '${AppEnv.crmUrl}/redeem?coupon=${coupon.couponCode}&type=${coupon.rewardType}';
  }
}

// --- Data Models ---

class UserBalance {
  final int testoPoints;
  final int farmPoints;
  const UserBalance({required this.testoPoints, required this.farmPoints});
}

class RewardTier {
  final String id;
  final String title;
  final String description;
  final String icon;
  final int pointsCost;
  final String rewardType; // 'testo' or 'farm'
  final int color;
  const RewardTier({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.pointsCost,
    required this.rewardType,
    required this.color,
  });
}

class GameCoupon {
  final String id;
  final String couponCode;
  final String rewardType;
  final String rewardId;
  final int pointsSpent;
  final bool isRedeemed;
  final DateTime createdAt;

  const GameCoupon({
    required this.id,
    required this.couponCode,
    required this.rewardType,
    required this.rewardId,
    required this.pointsSpent,
    required this.isRedeemed,
    required this.createdAt,
  });

  factory GameCoupon.fromJson(Map<String, dynamic> json) {
    return GameCoupon(
      id: json['id']?.toString() ?? '',
      couponCode: json['coupon_code']?.toString() ?? '',
      rewardType: json['reward_type']?.toString() ?? '',
      rewardId: json['reward_id']?.toString() ?? '',
      pointsSpent: (json['points_spent'] as num?)?.toInt() ?? 0,
      isRedeemed: json['is_redeemed'] == true,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
