import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

export interface PurchaseRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: 'course' | 'o_test' | 'teacho_pass';
  payment_id: string;
  buyer_name?: string | null;
  buyer_contact?: string | null;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  created_at?: string;
}

export const purchaseService = {
  /**
   * Submit a new payment ID / UPI Reference for course or test access
   */
  async submitPurchase(
    userId: string,
    itemId: string,
    itemType: 'course' | 'o_test' | 'teacho_pass',
    paymentId: string,
    buyerName: string | null = null,
    buyerContact: string | null = null,
    statusOverride: 'PENDING' | 'APPROVED' = 'PENDING'
  ): Promise<PurchaseRecord> {
    const cleanPaymentId = (paymentId || '').trim();

    // 1. Check for duplicate UPI Reference numbers
    if (cleanPaymentId && !cleanPaymentId.toUpperCase().startsWith('PAID-') && !cleanPaymentId.toUpperCase().startsWith('FREE-')) {
      try {
        const { data: existingPayment } = await supabase
          .from('purchases')
          .select('id')
          .eq('payment_id', cleanPaymentId)
          .limit(1);

        if (existingPayment && existingPayment.length > 0) {
          const errorMsg =
            '⚠️ STRICT WARNING ⚠️\n\nThis UPI Reference Number has already been used. Duplicate or fraudulent submissions are strictly monitored. Please enter a valid, unused 12-digit UPI UTR number.';
          Alert.alert('Duplicate Payment ID', errorMsg);
          throw new Error('Duplicate UPI Reference');
        }
      } catch (checkErr: any) {
        if (checkErr.message === 'Duplicate UPI Reference') throw checkErr;
      }
    }

    // 2. Insert into Supabase purchases table
    const purchaseData = {
      user_id: userId,
      item_id: String(itemId),
      item_type: itemType,
      payment_id: cleanPaymentId,
      buyer_name: buyerName,
      buyer_contact: buyerContact,
      status: statusOverride,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select();

      if (error) {
        console.warn('Supabase purchase insert notice:', error);
      }

      // Save locally to AsyncStorage for instant access cache
      await this.saveLocalPurchase(String(itemId), itemType);

      return data && data[0] ? data[0] : (purchaseData as PurchaseRecord);
    } catch (err) {
      // If table missing or offline, save locally
      await this.saveLocalPurchase(String(itemId), itemType);
      return purchaseData as PurchaseRecord;
    }
  },

  /**
   * Save unlocked purchase locally in AsyncStorage
   */
  async saveLocalPurchase(itemId: string, itemType: string) {
    try {
      const key = `purchased_${itemType}_${itemId}`;
      await AsyncStorage.setItem(key, 'APPROVED');
      const allPurchasesRaw = await AsyncStorage.getItem('user_unlocked_items');
      const allList = allPurchasesRaw ? JSON.parse(allPurchasesRaw) : [];
      if (!allList.includes(itemId)) {
        allList.push(itemId);
        await AsyncStorage.setItem('user_unlocked_items', JSON.stringify(allList));
      }
    } catch (e) {}
  },

  /**
   * Check if user has purchased an item (course or test)
   */
  async isItemPurchased(userId: string | undefined, itemId: string, itemType: string): Promise<boolean> {
    try {
      // 1. Check local cache first (0ms instant unlock)
      const key = `purchased_${itemType}_${itemId}`;
      const localStatus = await AsyncStorage.getItem(key);
      if (localStatus === 'APPROVED') return true;

      const allPurchasesRaw = await AsyncStorage.getItem('user_unlocked_items');
      if (allPurchasesRaw) {
        const allList = JSON.parse(allPurchasesRaw);
        if (allList.includes(itemId) || allList.includes('ALL_COURSES_PASS')) return true;
      }

      if (!userId) return false;

      // 2. Check Supabase purchases table
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', String(itemId))
        .eq('status', 'APPROVED')
        .limit(1);

      if (data && data.length > 0) {
        await this.saveLocalPurchase(itemId, itemType);
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  },

  /**
   * Redeem promo / access code (e.g. CENTUM100, POOVI100, ADMINPASS)
   */
  async redeemAccessCode(userId: string, itemId: string, itemType: 'course' | 'o_test', code: string): Promise<{ success: boolean; message: string }> {
    const clean = code.trim().toUpperCase();
    const VALID_CODES = ['CENTUM100', 'POOVI100', 'ADMINPASS', 'AISHLEE100', 'STUDENT100', 'FREEPASS'];

    if (VALID_CODES.includes(clean)) {
      await this.submitPurchase(
        userId,
        itemId,
        itemType,
        `PAID-CODE-${clean}`,
        'Promo User',
        null,
        'APPROVED'
      );
      return { success: true, message: `Access code "${clean}" applied! Full access unlocked.` };
    }

    return { success: false, message: 'Invalid or expired access code.' };
  },
};
export default purchaseService;
