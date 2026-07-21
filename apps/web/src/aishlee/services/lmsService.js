import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
import { dataService } from './dataService';

export const lmsService = {
  async publishCourse({ adminId, title, content, type, classLevel, language, curriculum = [], price = 0, thumbnailUrl = null, accessCode = null }) {
    // For legacy support or if they want to publish locally.
    const { data, error } = await supabase
      .from('lms_courses')
      .insert([{ admin_id: adminId, title, content, type, class_level: classLevel, language, curriculum, price, thumbnail_url: thumbnailUrl, access_code: accessCode }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateCourse(courseId, updateData, adminId) {
    const actualId = String(courseId).startsWith('db-') ? String(courseId).replace('db-', '') : courseId;
    const { data, error } = await supabase.from('lms_courses').update(updateData).eq('id', actualId).select();
    if (error) throw error;
    return data[0];
  },

  async updateCourseAccessCode(courseId, accessCode, adminId) {
    if (courseId === 'universal-admin-code') {
      const titleStr = 'Universal Access Code';
      const { data: existing } = await supabase.from('lms_courses').select('id').eq('title', titleStr).limit(1);
      if (existing && existing.length > 0) {
        const { error } = await supabase.from('lms_courses').update({ access_code: accessCode }).eq('id', existing[0].id);
        if (error) throw error;
      } else {
        if (!accessCode) return true; 
        if (!adminId) throw new Error("Admin ID is required to set access codes");
        const { error } = await supabase.from('lms_courses').insert([{
          admin_id: adminId,
          title: titleStr,
          content: 'Access Code Stub',
          type: 'Course',
          class_level: 'All',
          language: 'English',
          access_code: accessCode,
          price: 0
        }]);
        if (error) throw error;
      }
      return true;
    }

    const actualId = String(courseId).startsWith('db-') ? String(courseId).replace('db-', '') : courseId;
    const { error } = await supabase.from('lms_courses').update({ access_code: accessCode }).eq('id', actualId);
    if (error) throw error;
    return true;
  },

  async validateAndConsumeCode(accessCode) {
    // 1. Check if it's a valid code ever created
    const { data: courseData, error: courseError } = await supabase.from('lms_courses').select('id, access_code').eq('access_code', accessCode).limit(1);
    if (courseError || !courseData || courseData.length === 0) return false;
    
    // 2. Check if it's already consumed in purchases globally using secure RPC
    const { data: isConsumed, error: rpcError } = await supabase.rpc('is_code_consumed', { code_to_check: accessCode });
    if (rpcError) return false;
    if (isConsumed) return false; // Already consumed
    
    // We don't update lms_courses to nullify the code here because RLS blocks non-admins from updating courses.
    // Instead, the calling component will insert a 'purchases' record with this accessCode, marking it as consumed.
    return true;
  },

  async deleteCourse(courseId, adminId) {
    const actualId = String(courseId).startsWith('db-') ? String(courseId).replace('db-', '') : courseId;
    
    const { data, error } = await supabase.from('lms_courses').delete().eq('id', actualId).select();
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn("Delete returned no data. Check RLS policies.");
      throw new Error("Deletion blocked by Supabase RLS. You may not have permission to delete this.");
    }
    
    return true;
  },

  async getCourses(filters = {}) {
    const { data: dbCourses } = await supabase.from('lms_courses')
        .select('*');

    if (!dbCourses || dbCourses.length === 0) return [];

    // Filter out all access code stubs so they don't show up in the UI
    const validCourses = dbCourses.filter(c => 
      !c.title.includes('Access Code') && 
      c.content !== 'Reward Code Stub' && 
      c.content !== 'Access Code Stub'
    );

    let mappedDbCourses = validCourses.map(c => ({
      id: `db-${c.id}`, // Maintain db- prefix so old routing stays valid
      title: c.title,
      content: c.content,
      description: c.content,
      category: c.class_level,
      class_level: c.class_level,
      language: c.language,
      type: c.type || 'Course',
      price: c.price,
      thumbnailUrl: c.thumbnail_url,
      curriculum: c.curriculum || [],
      instructor: 'Aishlee Tech',
      students: 0,
      rating: 5.0,
      created_at: c.created_at,
    }));
    
    // Filter DB courses by current filters
    if (filters.classLevel && filters.classLevel !== 'All') {
      mappedDbCourses = mappedDbCourses.filter(c => {
        const cat = c.class_level || c.category || "";
        
        if (filters.classLevel === "TN State Board") {
          return cat.includes("TN Board") || cat.includes("State Board") || cat.includes("Samacheer");
        }
        if (filters.classLevel === "CBSE") {
          return cat.includes("CBSE");
        }
        if (filters.classLevel === "TNPSC") {
          return cat.includes("TNPSC") || cat.includes("TNTET") || cat.includes("TNFUSRC") || cat.includes("TNUSRB") || cat.includes("VAO");
        }
        if (filters.classLevel === "UPSC & Central") {
          return cat.includes("UPSC") || cat.includes("SSC") || cat.includes("RRB") || cat.includes("IBPS") || cat.includes("SBI") || cat.includes("IAS");
        }
        if (filters.classLevel === "Defense & Police") {
          return cat.includes("NDA") || cat.includes("CDS") || cat.includes("Army") || cat.includes("Navy") || cat.includes("Air Force") || cat.includes("Police") || cat.includes("BSF") || cat.includes("CRPF") || cat.includes("CISF") || cat.includes("SSB") || cat.includes("ITBP") || cat.includes("Agniveer");
        }
        if (filters.classLevel === "NEET / JEE") {
          return cat.includes("NEET") || cat.includes("JEE") || cat.includes("TNEA") || cat.includes("CUET") || cat.includes("GATE");
        }
        if (filters.classLevel === "Tech & Careers") {
          return cat.includes("Skills") || cat.includes("English") || cat.includes("Programming") || cat.includes("IT") || cat.includes("UGC NET");
        }
        
        return cat === filters.classLevel || c.category === filters.classLevel;
      });
    }
    if (filters.type && filters.type !== 'All') {
      mappedDbCourses = mappedDbCourses.filter(c => c.type === filters.type);
    }

    return mappedDbCourses;
  },

  // --- Course Progress Tracking ---
  async getCourseProgress(userId, courseId) {
    if (!userId || !courseId) return null;
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    if (error && error.code !== 'PGRST116') console.error('Error fetching progress:', error);
    return data || null;
  },

  async updateCourseProgress(userId, courseId, completedTopics, isCompleted = false) {
    if (!userId || !courseId) return null;
    // Try to get existing
    const existing = await this.getCourseProgress(userId, courseId);
    if (existing) {
      const { data, error } = await supabase
        .from('course_progress')
        .update({ completed_topics: completedTopics, is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('course_progress')
        .insert([{ user_id: userId, course_id: courseId, completed_topics: completedTopics, is_completed: isCompleted }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- Certificate Approvals ---
  async getCertificateRequest(userId, courseId) {
    if (!userId || !courseId) return null;
    const { data, error } = await supabase
      .from('certificate_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    if (error && error.code !== 'PGRST116') console.error('Error fetching certificate request:', error);
    return data || null;
  },

  async requestCertificate(userId, courseId, score = 0) {
    if (!userId || !courseId) return null;
    const existing = await this.getCertificateRequest(userId, courseId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('certificate_requests')
      .insert([{ user_id: userId, course_id: courseId, status: 'pending', score }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAllCertificateRequests() {
    const { data, error } = await supabase
      .from('certificate_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Fetch user details manually since foreign key is missing
    const userIds = [...new Set(data.map(r => r.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    const profileMap = {};
    if (profiles) {
      profiles.forEach(p => profileMap[p.id] = p.full_name || 'Unknown User');
    }
    
    return data.map(req => ({
      ...req,
      auth_users: { email: profileMap[req.user_id] || 'Unknown User' } // Keeping the same object shape for UI compatibility
    }));
  },

  async updateCertificateStatus(requestId, status, adminId) {
    const { data, error } = await supabase
      .from('certificate_requests')
      .update({ status, approved_by: adminId, approved_at: status === 'approved' ? new Date().toISOString() : null })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveQuizToTopic(courseId, topicTitle, quizData) {
    const actualId = String(courseId).startsWith('db-') ? String(courseId).replace('db-', '') : courseId;
    
    const { data: course, error: fetchError } = await supabase
      .from('lms_courses')
      .select('curriculum')
      .eq('id', actualId)
      .single();
      
    if (fetchError || !course) throw new Error("Course not found");
    
    const curriculum = course.curriculum || [];
    let updated = false;
    
    for (let module of curriculum) {
      if (module.topics) {
        for (let topic of module.topics) {
          if (topic.title === topicTitle) {
            topic.saved_quiz = quizData;
            updated = true;
          }
        }
      }
    }
    
    if (!updated) throw new Error("Topic not found in curriculum");
    
    const { error: updateError } = await supabase
      .from('lms_courses')
      .update({ curriculum })
      .eq('id', actualId);
      
    if (updateError) throw updateError;
    return true;
  }
};
