import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export const financeService = {
  getLoans: async (filters = {}) => {
    let query = supabase
      .from('loans')
      .select('*, profiles!inner(full_name, whatsapp, allotted_to)')
      .order('created_at', { ascending: false });
      
    if (filters.allotted_to) {
      query = query.eq('profiles.allotted_to', filters.allotted_to);
    }
    if (filters.status) {
      // NOTE: For loans, 'PENDING' is actually 'SUBMITTED' in the DB.
      const loanStatus = filters.status === 'PENDING' ? 'SUBMITTED' : filters.status;
      query = query.eq('status', loanStatus);
    }
      
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
    return data;
  },

  getPendingLoans: async () => {
    const { data, error } = await supabase
      .from('loans')
      .select('*, profiles(full_name)')
      .eq('status', 'SUBMITTED')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending loans:', error);
      throw error;
    }
    return data;
  },

  updateLoanStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('loans')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  applyForLoan: async (loanData) => {
    const { data, error } = await supabase
      .from('loans')
      .insert([loanData])
      .select();

    if (error) {
      console.error('Error applying for loan:', error);
      throw error;
    }
    return data[0];
  }
};
