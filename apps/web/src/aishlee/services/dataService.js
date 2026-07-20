import { supabase } from '../lib/supabaseClient';
import { dashboardSheetsService } from './dashboardSheetsService';

export const dataService = {
  fetchNews: async () => {
    try {
      return await dashboardSheetsService.fetchNews();
    } catch (e) {
      console.warn("Sheets fetch failed for news, falling back to Supabase", e);
      const { data, error } = await supabase.from('news_feed').select('*').order('created_at', { ascending: false });
      if (error || !data) return { tn: [], india: [], world: [] };
      return {
        tn: data.filter(n => n.category === 'tn'),
        india: data.filter(n => n.category === 'india'),
        world: data.filter(n => n.category === 'world')
      };
    }
  },

  fetchPoll: async () => {
    try {
      return await dashboardSheetsService.fetchPoll();
    } catch (e) {
      console.warn("Sheets fetch failed for poll, falling back to Supabase", e);
      const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false }).limit(1);
      if (error || !data || data.length === 0) return null;
      const p = data[0];
      return {
        question: p.question,
        options: [
          { id: 1, text: p.opt1, votes: p.opt1_votes },
          { id: 2, text: p.opt2, votes: p.opt2_votes },
          { id: 3, text: p.opt3, votes: p.opt3_votes }
        ].filter(o => o.text)
      };
    }
  },


  fetchDailyContent: async () => {
    try {
      return await dashboardSheetsService.fetchDailyContent();
    } catch (e) {
      console.warn("Sheets fetch failed for daily content, falling back to Supabase", e);
      const { data, error } = await supabase.from('daily_content').select('*').order('created_at', { ascending: false }).limit(1);
      if (error || !data || data.length === 0) return null;
      const d = data[0];
      return {
        thirukkural: d.thirukkural,
        thirukkuralMeaning: d.thirukkural_meaning,
        quote: d.quote,
        quoteAuthor: d.quote_author,
        gkQuestion: d.gk_question,
        gkAnswer: d.gk_answer
      };
    }
  },


  fetchJobs: async () => {
    try {
      return await dashboardSheetsService.fetchJobs();
    } catch (e) {
      console.warn("Sheets fetch failed for jobs, falling back to Supabase", e);
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(j => ({
        JobTitle: j.job_title,
        Category: j.category,
        Location: j.location,
        ApplyLink: j.apply_link,
        DateAdded: j.date_added
      }));
    }
  },

  fetchMasterData: async (type, user) => {
    if (type === 'COURSE') {
      return []; // Courses are handled natively in Supabase now
    }

    try {
      // First try to fetch from CSV sheets
      const isSuperAdmin = user?.role === 'Super Admin' || user?.custom_claims?.role === 'Super Admin';
      const pincodeToPass = isSuperAdmin ? null : (user?.pincode || user?.custom_claims?.pincode);
      
      const csvData = await dashboardSheetsService.fetchMasterData(type, pincodeToPass);
      if (csvData && csvData.length > 0) return csvData;
    } catch (e) {
      console.warn(`Sheets fetch failed for master data type ${type}, falling back to Supabase`, e);
    }
    
    // Fallback to Supabase
    let query = supabase.from('unified_master_data').select('*').eq('item_type', type).eq('approval_status', 'PUBLISHED');
    if (user && user.role !== 'Super Admin') {
      if (user.permanent_pincode) {
        query = query.eq('permanent_pincode', String(user.permanent_pincode).trim());
      }
    }
    const { data, error } = await query;
    if (error || !data) return [];
    
    return data.map(row => {
      const slug = String(row.title_name || `row-${row.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        id: `db-${slug}`,
        title: row.title_name,
        content: row.description_purpose,
        description: row.description_purpose,
        category: row.category,
        class_level: row.category,
        language: row.language || 'English/Tamil',
        price: 0,
        thumbnail: null,
        instructor: 'Aishlee Tech',
        students: 0,
        rating: 5.0,
        ...row
      };
    });
  }
};
