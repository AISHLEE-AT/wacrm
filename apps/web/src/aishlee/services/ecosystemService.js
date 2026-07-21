import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export const ecosystemService = {
  async createListing(listingData) {
    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getListings(filters = {}) {
    let query = supabase.from('listings').select(`
      *,
      profiles!inner(full_name, whatsapp, role, allotted_to)
    `).order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.lister_id) query = query.eq('lister_id', filters.lister_id);
    if (filters.allotted_to) query = query.eq('profiles.allotted_to', filters.allotted_to);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateListingStatus(id, status) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },

  async getMessages(listingId) {
    const { data, error } = await supabase
      .from('marketplace_messages')
      .select(`
        *,
        profiles:sender_id (full_name, role, whatsapp)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  async sendMessage(listingId, senderId, content) {
    const { data, error } = await supabase
      .from('marketplace_messages')
      .insert([{ listing_id: listingId, sender_id: senderId, content }])
      .select();
      
    if (error) throw error;
    return data[0];
  },

  subscribeToMessages(listingId, callback) {
    return supabase
      .channel(`messages-${listingId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'marketplace_messages',
        filter: `listing_id=eq.${listingId}`
      }, payload => {
        callback(payload.new);
      })
      .subscribe();
  },

  async getStats() {
    const { data, error } = await supabase.from('listings').select('type', { count: 'exact' }).eq('status', 'APPROVED');
    if (error) throw error;
    
    let courses = 0;
    let loans = 0;
    let ecosystem = 0;

    data.forEach(item => {
      if (item.type === 'Course') courses++;
      else if (item.type === 'Loan') loans++;
      else ecosystem++; // Land, Grocery, Farmer, Product
    });

    return { courses, loans, ecosystem };
  },

  async injectDemoData(adminId) {
    const demoItems = [
      {
        lister_id: adminId, title: "5 Acre Agricultural Land in Coimbatore", description: "Fertile red soil land with free borewell access and EB connection. Ideal for coconut or banana cultivation.",
        price: 2500000, type: "Land", status: "PENDING", details: { "Area": "5 Acres", "Location": "Coimbatore District" }
      },
      {
        lister_id: adminId, title: "Commercial Plot near IT Park Chennai", description: "Prime 2400 sqft corner plot ready for construction. Approved by CMDA. High ROI potential.",
        price: 8500000, type: "Land", status: "PENDING", details: { "Area": "2400 Sq Ft", "Location": "OMR, Chennai" }
      },
      {
        lister_id: adminId, title: "Advanced Jetpack Compose Masterclass", description: "Learn Android native UI development with Jetpack Compose. Includes state management, animations, and MVVM architecture.",
        price: 2999, type: "Course", status: "PENDING", details: { "Duration": "8 Weeks", "Level": "Advanced" }
      },
      {
        lister_id: adminId, title: "React Native Fullstack Development", description: "Build iOS and Android apps using React Native, Supabase, and Node.js. 100% practical curriculum.",
        price: 1500, type: "Course", status: "PENDING", details: { "Duration": "4 Weeks", "Level": "Beginner to Pro" }
      },
      {
        lister_id: adminId, title: "Organic Ponni Rice (Direct Farm)", description: "Chemical-free traditional Ponni raw rice directly from Thanjavur farmers. Export quality.",
        price: 1800, type: "Farmer", status: "PENDING", details: { "Quantity/Stock": "100 Bags (25kg each)", "Origin": "Thanjavur Delta Farms" }
      },
      {
        lister_id: adminId, title: "Cold Pressed Groundnut Oil", description: "100% pure mara chekku kadalai ennai (wood pressed). No preservatives. High in nutrients.",
        price: 240, type: "Grocery", status: "PENDING", details: { "Quantity/Stock": "500 Liters", "Origin": "Madurai" }
      },
      {
        lister_id: adminId, title: "MSME Tech Startup Loan", description: "Collateral-free micro loans for local technology and digital service startups in Tamil Nadu.",
        price: 500000, type: "Loan", status: "PENDING", details: { "Interest Rate": "8.5% p.a", "Tenure": "36 Months" }
      },
      {
        lister_id: adminId, title: "Women Entrepreneurship Microfinance", description: "Special loan scheme for women setting up digital shops or local manufacturing units.",
        price: 100000, type: "Loan", status: "PENDING", details: { "Interest Rate": "5.0% p.a", "Tenure": "24 Months" }
      }
    ];

    const { error } = await supabase.from('listings').insert(demoItems);
    if (error) throw error;
  }
};
