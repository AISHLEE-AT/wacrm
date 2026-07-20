import { supabase } from '../lib/supabaseClient';
import { notificationService } from './notificationService';

export const purchaseService = {
  // Submit a new payment ID for a course/product
  async submitPurchase(userId, itemId, itemType, paymentId, buyerName = null, buyerContact = null, statusOverride = 'PENDING') {
    // 1. Prevent Duplicate UPI IDs (ignore 'PAID-' access codes)
    if (paymentId && paymentId.trim() !== '' && !paymentId.toUpperCase().startsWith('PAID-')) {
      const { data: existingPayment } = await supabase
        .from('purchases')
        .select('id')
        .eq('payment_id', paymentId.trim())
        .limit(1);

      if (existingPayment && existingPayment.length > 0) {
        const errorMsg = '⚠️ STRICT WARNING ⚠️\n\nThis UPI Reference Number has already been used in our system.\n\nDuplicate or fraudulent payment submissions are strictly monitored and may result in immediate and permanent account suspension. Please enter a valid, unused UPI Reference Number.';
        alert(errorMsg);
        throw new Error('Duplicate UPI Reference');
      }
    }
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          user_id: userId,
          item_id: String(itemId), // Ensure it's a string for uniform comparison
          item_type: itemType,
          payment_id: paymentId,
          buyer_name: buyerName,
          buyer_contact: buyerContact,
          status: statusOverride
        }
      ])
      .select();

    if (error) {
      console.error('Error submitting purchase:', error);
      throw error;
    }

    // Send notifications to Admins
    try {
      const { data: admins } = await supabase.from('profiles').select('id').in('role', ['Admin', 'Super Admin']);
      if (admins) {
        for (const admin of admins) {
          await notificationService.createNotification(
            admin.id,
            'New Purchase Alert 🛍️',
            `A new payment (${paymentId}) was submitted by ${buyerName || 'a user'} for a ${itemType}.`
          );
        }
      }
    } catch (e) {
      console.error("Failed to notify admins", e);
    }

    return data[0];
  },

  // Fetch all purchases for the current logged-in user
  async getUserPurchases(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'HIDDEN');

    if (error) {
      console.error('Error fetching user purchases:', error);
      throw error;
    }

    // Enrich O-Test titles
    const oTestIds = data.filter(p => p.item_type === 'o_test').map(p => p.item_id);
    if (oTestIds.length > 0) {
      const { data: oTests } = await supabase
        .from('unified_master_data')
        .select('id, title_name')
        .in('id', oTestIds);
        
      if (oTests) {
        const titleMap = {};
        oTests.forEach(t => titleMap[t.id] = t.title_name);
        data.forEach(p => {
          if (p.item_type === 'o_test' && titleMap[p.item_id]) {
            p.enriched_title = titleMap[p.item_id];
          }
        });
      }
    }

    return data;
  },

  // For Admin: Get all pending purchases
  async getPendingPurchases() {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'PENDING');

    if (error) {
      console.error('Error fetching pending purchases:', error);
      throw error;
    }

    if (!purchases || purchases.length === 0) return [];

    // Fetch profiles for these users, filtering out nulls to prevent PostgREST errors
    const userIds = [...new Set(purchases.map(p => p.user_id).filter(Boolean))];
    let profiles = [];
    
    if (userIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, whatsapp')
        .in('id', userIds);
      if (data) profiles = data;
    }

    const profileMap = {};
    profiles.forEach(p => profileMap[p.id] = p);

    return purchases.map(p => ({
      ...p,
      profiles: profileMap[p.user_id] || null
    }));
  },

  // For Admin: Bulk approve based on a list of Payment IDs from the bank
  async bulkApprovePayments(paymentIdsArray) {
    if (!paymentIdsArray || paymentIdsArray.length === 0) return { updatedCount: 0 };
    
    // First, fetch the pending purchases matching these IDs to know who to notify
    const { data: purchasesToApprove } = await supabase
      .from('purchases')
      .select('*')
      .in('payment_id', paymentIdsArray)
      .eq('status', 'PENDING');

    if (!purchasesToApprove || purchasesToApprove.length === 0) return { updatedCount: 0 };

    // Convert array of strings to a format Supabase can filter on with .in()
    const { data, error } = await supabase
      .from('purchases')
      .update({ status: 'APPROVED' })
      .in('payment_id', paymentIdsArray)
      .eq('status', 'PENDING')
      .select();

    if (error) {
      console.error('Error bulk approving payments:', error);
      throw error;
    }

    // Send notifications to the users
    for (const purchase of purchasesToApprove) {
      await notificationService.createNotification(
        purchase.user_id,
        'Payment Approved! 🎉',
        `Your payment (${purchase.payment_id}) for the course has been verified. You now have full access!`
      );
    }

    return { updatedCount: data ? data.length : 0, approvedRecords: data };
  },

  // Delete a purchase (used by user to remove order from list)
  async deletePurchase(purchaseId) {
    const { error } = await supabase
      .from('purchases')
      .update({ status: 'HIDDEN' })
      .eq('id', purchaseId);
      
    if (error) {
      console.error('Error hiding purchase:', error);
      throw error;
    }
    return true;
  }
};
