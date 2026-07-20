/* eslint-disable no-useless-escape */
import Papa from 'papaparse';

// Helper to get modular URLs
const getCsvUrl = (key) => {
  if (key === 'lms' || key === 'course') {
    return "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ8ZMFKWHu6xieQE7sie1ihBepXQ2HbqStU_4sr8GebnoRjmxgnsDF9tfCf1xUfrUeTvu-3Gakoayu/pub?gid=1229666970&single=true&output=csv";
  }

  // Hardcoded fallback provided by user for Media/News
  if (key === 'media') {
    return "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSKG_6jz38K8FMvNy01SogE9IgzdmXBCqx5JteWn8_YxGLPBa4M6041RTlNytmsXCfHqqujQQttR31/pub?gid=779013775&single=true&output=csv";
  }
  
  // Hardcoded fallback provided by user for Jobs
  if (key === 'jobs') {
    return "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSKG_6jz38K8FMvNy01SogE9IgzdmXBCqx5JteWn8_YxGLPBa4M6041RTlNytmsXCfHqqujQQttR31/pub?gid=779013775&single=true&output=csv";
  }
  
  return null;
};

// Caching to prevent spamming the CSV on parallel calls
let cachedData = null;
let lastFetch = 0;
let cachedMasterData = null;
let lastMasterFetch = 0;

const fetchModularSheet = (key) => {
  const url = getCsvUrl(key);
  if (!url) return Promise.resolve([]);
  return new Promise((resolve) => {
    Papa.parse(url + '&t=' + Date.now(), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: () => resolve([]) // fail silently for missing sheets
    });
  });
};

const fetchUnifiedMaster = async () => {
  const now = Date.now();
  if (cachedMasterData && (now - lastMasterFetch < 5000)) return cachedMasterData;
  
  const [lms, marketplace, finance] = await Promise.all([
    fetchModularSheet('lms'),
    fetchModularSheet('marketplace'),
    fetchModularSheet('finance')
  ]);
  
  // Tag items with their type if not present based on source
  const typedLms = lms.map(r => ({...r, ItemType: 'COURSE'}));
  const typedMarketplace = marketplace.map(r => ({...r, ItemType: 'PRODUCT'}));
  const typedFinance = finance.map(r => ({...r, ItemType: 'LOAN'}));
  
  const combined = [...typedLms, ...typedMarketplace, ...typedFinance];
  cachedMasterData = combined;
  lastMasterFetch = now;
  return combined;
};

const fetchUnifiedSheet = async () => {
  const now = Date.now();
  if (cachedData && (now - lastFetch < 5000)) return cachedData;
  const url = getCsvUrl('media');
  if (!url) return [];
  
  return new Promise((resolve, reject) => {
    Papa.parse(url + '&t=' + now, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        cachedData = results.data;
        lastFetch = now;
        resolve(results.data);
      },
      error: (error) => reject(error)
    });
  });
};

const fetchJobsSheet = async () => {
  const url = getCsvUrl('jobs');
  if (!url) return [];
  return new Promise((resolve, reject) => {
    Papa.parse(url + '&t=' + Date.now(), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

const fetchYouTubeSheet = async () => {
  const url = getCsvUrl('youtube') || "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1J4fRnx1-sIDmRLvcs9aXSkiLPP_7Q90aGB6lu77VozgCSYeqwNguOw4RbZ5CshsfBEXO63gZlOMa/pub?gid=1358783801&single=true&output=csv";
  if (!url) return [];
  return new Promise((resolve, reject) => {
    Papa.parse(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

export const dashboardSheetsService = {
  async fetchYouTubeFeeds() {
    try {
      const raw = await fetchYouTubeSheet();
      if (!raw || raw.length === 0) return [];
      
      const mapped = raw.map(row => ({
        videoId: row['VideoID'],
        title: row['Title'],
        category: row['Category'],
        thumbnail: row['Thumbnail'],
        publishedAt: row['PublishedAt']
      })).filter(v => v.videoId);
      
      // Remove duplicate videos by videoId
      const uniqueVideos = [];
      const seenIds = new Set();
      for (const video of mapped) {
        if (!seenIds.has(video.videoId)) {
          seenIds.add(video.videoId);
          uniqueVideos.push(video);
        }
      }
      return uniqueVideos;
    } catch (e) {
      console.error("Failed to fetch YouTube feeds", e);
      return [];
    }
  },

  async fetchLMSYouTubeFeeds() {
    const url = getCsvUrl('lmsYoutube') || "https://docs.google.com/spreadsheets/d/e/2PACX-1vSa91yhsjLPAmoeBv2GQsttgDfU-j3qHzGy_LIPa7LzWPVC9yaz-cMAFDb4hR7it-3ROrg7dcIOqp3h/pub?gid=1227338388&single=true&output=csv";
    if (!url) return [];
    
    return new Promise((resolve, reject) => {
      Papa.parse(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) return resolve([]);
          
          const mapped = results.data.map(row => ({
            videoId: row['VideoID'],
            title: row['Title'],
            category: row['Category'],
            thumbnail: row['Thumbnail'],
            publishedAt: row['PublishedAt'],
            channelName: row['ChannelName']
          })).filter(v => v.videoId);
          
          const uniqueVideos = [];
          const seenIds = new Set();
          for (const video of mapped) {
            if (!seenIds.has(video.videoId)) {
              seenIds.add(video.videoId);
              uniqueVideos.push(video);
            }
          }
          resolve(uniqueVideos);
        },
        error: (error) => reject(error)
      });
    });
  },

  async fetchNews() {
    try {
      const raw = await fetchUnifiedSheet();
      if (!raw || raw.length === 0 || (!raw[0]['News_TN_Headline'] && !raw[0]['News_India_Headline'])) throw new Error("No data");

      const extractNews = (prefix, limit) => {
        return raw.slice(0, limit).map(row => ({
          headline: row[`News_${prefix}_Headline`],
          url: row[`News_${prefix}_URL`],
          date: row[`News_${prefix}_Date`] || '',
          source: row[`News_${prefix}_Source`] || 'Google News'
        })).filter(n => n.headline);
      };

      return {
        tn: extractNews('TN', 7),
        india: extractNews('India', 5),
        world: extractNews('World', 3)
      };
    } catch (e) {
      console.warn("Falling back to mock news", e);
      const mockNews = Array(5).fill({ headline: 'Live news syncing from Google Sheets...', source: 'Admin Sheet' });
      return { tn: mockNews, india: mockNews, world: mockNews };
    }
  },

  async fetchPoll() {
    try {
      const raw = await fetchUnifiedSheet();
      if (!raw[0]?.Poll_Question) throw new Error("No poll data");
      
      const qText = raw[0]['Poll_Question'];
      const dateStr = new Date().toISOString().split('T')[0];
      const safeId = qText.substring(0, 15).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const pollId = `poll-${safeId}-${dateStr}`;

      return {
        poll_id: pollId,
        question: qText,
        options: [
          { id: 1, text: raw[0]['Poll_Opt1'], votes: 0 },
          { id: 2, text: raw[0]['Poll_Opt2'], votes: 0 },
          { id: 3, text: raw[0]['Poll_Opt3'], votes: 0 }
        ].filter(o => o.text),
        points_reward: 5
      };
    } catch {
      return {
        question: "How do you feel about the new Digital ID platform?",
        options: [
          { id: 1, text: "It's amazing!", votes: 45 },
          { id: 2, text: "Needs more features", votes: 30 },
          { id: 3, text: "Not sure yet", votes: 25 }
        ]
      };
    }
  },



  async fetchDailyContent() {
    try {
      const raw = await fetchUnifiedSheet();
      if (!raw || raw.length === 0) throw new Error("No data received");
      
      const firstRow = raw[0];
      const keys = Object.keys(firstRow);
      
      const findKey = (searchKey) => {
        const normalizedSearch = searchKey.toLowerCase().replace(/[^a-z0-9]/g, '');
        return keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearch);
      };

      const thirukkuralKey = findKey('Thirukkural') || 'Thirukkural';
      
      if (!firstRow[thirukkuralKey]) throw new Error("No daily content");
      
      return {
        thirukkural: firstRow[thirukkuralKey],
        thirukkuralMeaning: firstRow[findKey('ThirukkuralMeaning') || 'Thirukkural_Meaning'],
        quote: firstRow[findKey('Quote') || 'Quote'],
        quoteAuthor: firstRow[findKey('QuoteAuthor') || 'Quote_Author'],
        gkQuestion: firstRow[findKey('GKQuestion') || 'GK_Question'],
        gkAnswer: firstRow[findKey('GKAnswer') || 'GK_Answer']
      };
    } catch {
      return {
        thirukkural: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
        thirukkuralMeaning: "As the letter A is the first of all letters, so the eternal God is first in the world.",
        quote: "The best way to predict the future is to create it.",
        quoteAuthor: "Peter Drucker",
        gkQuestion: "Which is the longest river in Tamil Nadu?",
        gkAnswer: "Kaveri (Cauvery)"
      };
    }
  },



  async fetchJobs() {
    try {
      const raw = await fetchUnifiedSheet();
      // Ensure we have the new jobs schema
      if (!raw || raw.length === 0 || !raw[0]['Job_Title']) {
        throw new Error("Invalid jobs data schema");
      }
      return raw.filter(row => row['Job_Title']).map(j => ({
        JobTitle: j['Job_Title'],
        Category: j['Category'] || j['Job_Type'],
        Location: j['Location'],
        ApplyLink: j['Apply_URL'],
        DateAdded: j['Posted_Date']
      }));
    } catch {
      console.warn("Falling back to mock jobs data");
      // Fallback mock data matching the new unified schema
      return [
        { DateAdded: new Date().toLocaleDateString('en-IN'), JobTitle: 'TNPSC Group 4 VAO', Category: 'TN Govt', Location: 'Tamil Nadu', ApplyLink: 'https://tnpsc.gov.in' },
        { DateAdded: new Date().toLocaleDateString('en-IN'), JobTitle: 'SSC CGL 2026 Notification', Category: 'India Govt', Location: 'Pan-India', ApplyLink: 'https://ssc.nic.in' },
        { DateAdded: new Date().toLocaleDateString('en-IN'), JobTitle: 'Software Engineer - React (Walk-in)', Category: 'Private', Location: 'Chennai, TN', ApplyLink: '#' },
        { DateAdded: new Date().toLocaleDateString('en-IN'), JobTitle: 'SBI PO Recruitment', Category: 'India Govt', Location: 'Pan-India', ApplyLink: 'https://sbi.co.in/web/careers' },
        { DateAdded: new Date().toLocaleDateString('en-IN'), JobTitle: 'Customer Support Executive', Category: 'Private', Location: 'Coimbatore, TN', ApplyLink: '#' },
      ];
    }
  },

  async fetchMasterData(type, userPincode) {
    try {
      const raw = await fetchUnifiedMaster();
      if (!raw || raw.length === 0) return [];
      
      return raw.filter(row => {
        // Filter by Type
        if (row.ItemType !== type) return false;
        // Filter by Pincode if userPincode is provided and row has a pincode
        if (userPincode && (row.Permanent_Pincode || row.Pincode)) {
          const rowPin = String(row.Permanent_Pincode || row.Pincode).trim();
          if (rowPin !== '' && rowPin !== String(userPincode).trim()) return false;
        }
        // Filter out non-published if it's a Course or Product
        if (type === 'COURSE' || type === 'PRODUCT') {
          const status = String(row.ApprovalStatus || row.Approval_Status || '').trim().toUpperCase();
          if (status !== 'PUBLISHED') return false;
        }
        return true;
      }).map((row, index) => {
        const slug = String(row.Title_Name || `row-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return {
        id: `sheet-v2-${slug}`,
        title: row.Title_Name,
        content: row.Description_Purpose,
        description: row.Description_Purpose,
        category: row.Category,
        class_level: row.Category, // mapping category to class_level for LMS
        language: 'English/Tamil', // default or extract if needed
        type: row.Category === 'Quizzes' ? 'Quiz Creator' : 'Course',
        price: parseFloat(row.Price || row.PriceOrAmount || 0),
        amount: parseFloat(row.Amount || row.PriceOrAmount || 0), // for loans
        profiles: {
          full_name: row.Coach_Guide_Name || row.Instructor_Seller_Applicant || row.Instructor || 'Admin',
          whatsapp: row.Contact_Whatsapp || row.WhatsApp_Number || row.WhatsApp || ''
        },
        instructor: row.Coach_Guide_Name || row.Instructor_Seller_Applicant || row.Instructor || 'Admin',
        seller: row.Instructor_Seller_Applicant || row.Seller || 'Admin',
        applicant: row.Instructor_Seller_Applicant || 'Admin',
        whatsappNumber: row.Contact_Whatsapp || row.WhatsApp_Number || row.WhatsApp || '',
        mediaUrl: row.Lessons_MediaUrl || row.Links_Data,
        videoId: (row.Lessons_MediaUrl || row.Links_Data) ? ((row.Lessons_MediaUrl || row.Links_Data).match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] || null) : null,
        playlistId: (row.Lessons_MediaUrl || row.Links_Data) ? ((row.Lessons_MediaUrl || row.Links_Data).match(/[?&]list=([a-zA-Z0-9_-]+)/i)?.[1] || null) : null,
        thumbnail: (row.Lessons_MediaUrl || row.Links_Data) && (row.Lessons_MediaUrl || row.Links_Data).match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i) ? `https://img.youtube.com/vi/${(row.Lessons_MediaUrl || row.Links_Data).match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)[1]}/hqdefault.jpg` : null,
        termMonths: row.Type_TermMonths,
        productType: row.Type_TermMonths,
        riskScore: row.RiskScore_CreditRating,
        emi: row.EmiAmount_Extra,
        curriculum: (() => {
          const content = row.Lessons_MediaUrl || row.Links_Data;
          if (!content || typeof content !== 'string' || !content.startsWith('[')) return [];
          try { return JSON.parse(content); } catch { return []; }
        })(),
        created_at: new Date().toISOString()
        };
      });
    } catch (e) {
      console.error(`Error fetching master data for ${type}:`, e);
      return [];
    }
  },

  async importToSupabase(supabase) {
    let stats = { success: true, message: "Import completed successfully." };
    try {
      // 1. Fetch Unified Master Sheet Data
      const masterData = await fetchUnifiedMaster();
      if (masterData && masterData.length > 0) {
        // Fetch existing to avoid duplication by title
        const { data: existingData } = await supabase.from('unified_master_data').select('id, title_name, item_type');
        const existingMap = {};
        if (existingData) {
          existingData.forEach(row => {
            if (row.title_name) existingMap[`${row.item_type}-${row.title_name}`] = row.id;
          });
        }
        
        const keptIds = new Set();
        
        const mappedMaster = masterData.filter(r => r.ItemType && r.Title_Name).map(r => {
          const payload = {
            item_type: r.ItemType,
            title_name: r.Title_Name,
            description_purpose: r.Description_Purpose,
            category: r.Category,
            permanent_pincode: r.Permanent_Pincode || r.Pincode,
            approval_status: r.ApprovalStatus || 'PUBLISHED',
            links_data: r.Links_Data,
            additional_info: r.Additional_Info,
            language: r.Language
          };
          
          const existingId = existingMap[`${r.ItemType}-${r.Title_Name}`];
          if (existingId) {
            payload.id = existingId; // Will trigger update in upsert
            keptIds.add(existingId);
          }
          return payload;
        });

        if(mappedMaster.length > 0) {
           await supabase.from('unified_master_data').upsert(mappedMaster);
        }
      }

      // 2. Fetch Jobs
      const jobsData = await fetchJobsSheet();
      if (jobsData && jobsData.length > 0) {
        const { data: existingJobs } = await supabase.from('jobs').select('id, job_title');
        const jobsMap = {};
        if (existingJobs) {
          existingJobs.forEach(row => {
            if (row.job_title) jobsMap[row.job_title] = row.id;
          });
        }
        
        const keptJobsIds = new Set();
        
        const mappedJobs = jobsData.filter(j => j.JobTitle).map(j => {
          const payload = {
            job_title: j.JobTitle,
            category: j.Category,
            location: j.Location,
            apply_link: j.ApplyLink,
            date_added: j.DateAdded
          };
          if (jobsMap[j.JobTitle]) {
            payload.id = jobsMap[j.JobTitle];
            keptJobsIds.add(payload.id);
          }
          return payload;
        });
        
        if(mappedJobs.length > 0) await supabase.from('jobs').upsert(mappedJobs);
      }
      
      // 3. Fetch News, Polls, Market, Stocks from Unified Sheet
      const unifiedData = await fetchUnifiedSheet();
      if (unifiedData && unifiedData.length > 0) {
        const row = unifiedData[0];
        
        // Daily Content
        if(row.Thirukkural) {
           await supabase.from('daily_content').delete().neq('id', '00000000-0000-0000-0000-000000000000');
           await supabase.from('daily_content').insert([{
             thirukkural: row['Thirukkural'],
             thirukkural_meaning: row['Thirukkural Meaning'],
             quote: row['Quote'],
             quote_author: row['Quote Author'],
             gk_question: row['GK Question'],
             gk_answer: row['GK Answer']
           }]);
        }
        

        
        // Polls
        if (row.Poll_Question) {
           await supabase.from('polls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
           await supabase.from('polls').insert([{
             question: row.Poll_Question,
             opt1: row.Poll_Opt1, opt1_votes: parseInt(row.Poll_Votes1)||0,
             opt2: row.Poll_Opt2, opt2_votes: parseInt(row.Poll_Votes2)||0,
             opt3: row.Poll_Opt3, opt3_votes: parseInt(row.Poll_Votes3)||0
           }]);
        }
        

      }
      
      return stats;
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  }
};
