import { gameoSupabase } from './gameoSupabase';

export interface UserBalance {
  testoPoints: number;
  farmPoints: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  value: number;
  currency: string;
  type: string;
}

export interface Coupon {
  id: string;
  reward_id: string;
  coupon_code: string;
  issued_at: string;
  reward: Reward;
}

export const RewardsService = {
  async getUserBalance(userId: string): Promise<UserBalance> {
    const { data, error } = await gameoSupabase.rpc('get_user_balance', { p_user_id: userId });
    
    if (error) {
      console.error('Error fetching balance:', error);
      return { testoPoints: 0, farmPoints: 0 };
    }
    
    return {
      testoPoints: data[0]?.testo_points || 0,
      farmPoints: data[0]?.farm_points || 0,
    };
  },

  async redeemReward(userId: string, reward: Reward): Promise<string | null> {
    const { data, error } = await gameoSupabase.rpc('redeem_points', {
      p_user_id: userId,
      p_points_cost: reward.points_cost,
      p_reward_id: reward.id,
      p_coupon_value: reward.value,
    });
      
    if (error) {
      console.error('Error redeeming reward:', error);
      return null;
    }
    return data; // The generated coupon code
  },

  async getUserCoupons(userId: string): Promise<Coupon[]> {
    const { data, error } = await gameoSupabase
      .from('game_rewards')
      .select('*, reward:reward_id(*)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
    
    return data as Coupon[];
  },

  async syncPointsToServer(userId: string, pointsEarned?: number): Promise<boolean> {
    // If pointsEarned is provided, use it (from 3D game), otherwise simulate
    const testoPointsToSync = pointsEarned ?? (Math.floor(Math.random() * 50) + 10);
    const farmPointsToSync = Math.floor(Math.random() * 30) + 5;
    
    const { error } = await gameoSupabase.rpc('sync_offline_points', {
      p_user_id: userId,
      p_testo_points: testoPointsToSync,
      p_farm_points: farmPointsToSync,
    });
      
    if (error) {
      console.error('Error syncing points:', error);
      return false;
    }
    return true;
  }
};
