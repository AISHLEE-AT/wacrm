import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

class ProfileSyncService {
  async getProfile(userId) {
    const cacheKey = `profile_${userId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      if (data) localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Error fetching profile:', e);
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
      return null;
    }
  }

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    localStorage.removeItem(`profile_${userId}`);
    return data;
  }

  async getTransactions(userId) {
    const cacheKey = `transactions_${userId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this._fetchTransactions(userId, cacheKey); // background update
        return JSON.parse(cached);
      }
      return await this._fetchTransactions(userId, cacheKey);
    } catch (e) {
      console.error('Error getting transactions:', e);
      return [];
    }
  }

  async _fetchTransactions(userId, cacheKey) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    if (data) localStorage.setItem(cacheKey, JSON.stringify(data));
    return data || [];
  }

  async getOrders(userId) {
    const cacheKey = `orders_${userId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this._fetchOrders(userId, cacheKey); // background update
        return JSON.parse(cached);
      }
      return await this._fetchOrders(userId, cacheKey);
    } catch (e) {
      console.error('Error getting orders:', e);
      return [];
    }
  }

  async _fetchOrders(userId, cacheKey) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    if (data) localStorage.setItem(cacheKey, JSON.stringify(data));
    return data || [];
  }
}

export const profileSyncService = new ProfileSyncService();
