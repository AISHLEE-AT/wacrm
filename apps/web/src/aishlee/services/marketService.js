import { supabase } from '../lib/supabaseClient';

export const marketService = {
  getProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data;
  },

  addProduct: async (productData) => {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }
    return data[0];
  }
};
