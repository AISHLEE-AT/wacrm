import { supabase } from '../lib/supabaseClient';

// Hardcoded Internal Vacancies for Aishlee Tech
export const INTERNAL_JOBS = [
  // AI / Data Science
  { id: 'ai-1', title: 'Senior AI Engineer', category: 'AI/ML', location: 'Remote / Chennai', type: 'Full-time', reqs: 'B.Tech/M.Tech + 3 yrs PyTorch/TensorFlow', salary: '₹8,00,000 - ₹15,00,000' },
  { id: 'ai-2', title: 'Prompt Engineer', category: 'AI/ML', location: 'Remote', type: 'Part-time', reqs: 'Strong English, understanding of LLM parameters', salary: '₹3,00,000 - ₹5,00,000' },
  { id: 'ai-3', title: 'Data Analyst Intern', category: 'AI/ML', location: 'Hybrid', type: 'Internship', reqs: 'SQL, Python basics, eager to learn', salary: '₹10,000 / month' },
  
  // Engineering (Frontend/Backend)
  { id: 'eng-1', title: 'React Frontend Developer', category: 'Engineering', location: 'Chennai', type: 'Full-time', reqs: 'React, Tailwind, 2+ yrs experience', salary: '₹5,00,000 - ₹10,00,000' },
  { id: 'eng-2', title: 'Backend Node.js Developer', category: 'Engineering', location: 'Remote', type: 'Full-time', reqs: 'Node.js, Supabase/PostgreSQL, API Design', salary: '₹6,00,000 - ₹12,00,000' },
  { id: 'eng-3', title: 'Junior Fullstack Dev', category: 'Engineering', location: 'Hybrid', type: 'Full-time', reqs: 'MERN stack basic knowledge, fresher welcome', salary: '₹3,00,000 - ₹4,50,000' },
  
  // Marketing & Growth
  { id: 'mkt-1', title: 'Digital Marketing Manager', category: 'Marketing', location: 'Chennai', type: 'Full-time', reqs: 'SEO, SEM, Meta Ads, 3 yrs experience', salary: '₹4,00,000 - ₹8,00,000' },
  { id: 'mkt-2', title: 'Content Creator (Tamil)', category: 'Marketing', location: 'Remote', type: 'Contract', reqs: 'Video editing, fluent in written/spoken Tamil', salary: '₹20,000 - ₹35,000 / month' },
  { id: 'mkt-3', title: 'Community Manager', category: 'Marketing', location: 'Remote', type: 'Part-time', reqs: 'Social media management, high empathy', salary: '₹15,000 - ₹25,000 / month' },
  
  // Human Resources
  { id: 'hr-1', title: 'HR Manager', category: 'Human Resources', location: 'Chennai', type: 'Full-time', reqs: 'MBA HR, Tech recruiting experience', salary: '₹4,00,000 - ₹7,00,000' },
  { id: 'hr-2', title: 'Technical Recruiter', category: 'Human Resources', location: 'Remote', type: 'Full-time', reqs: 'Ability to screen devs, sourcing on LinkedIn', salary: '₹3,00,000 - ₹5,00,000' },
  { id: 'hr-3', title: 'HR Intern', category: 'Human Resources', location: 'Hybrid', type: 'Internship', reqs: 'Excellent communication, organizational skills', salary: '₹8,000 / month' },
];

export const recruitmentService = {
  // Get all internal vacancies
  getInternalJobs: () => {
    return INTERNAL_JOBS;
  },

  // Apply for a job
  submitApplication: async (userId, job, coverLetter, resumeLink) => {
    const fullCoverLetter = resumeLink ? `${coverLetter}\n\nResume/LinkedIn: ${resumeLink}` : coverLetter;
    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          user_id: userId,
          job_title: job.title,
          category: job.category,
          cover_letter: fullCoverLetter,
          status: 'PENDING'
        }
      ]);

    if (error) throw error;
    return data;
  },

  // Get pending applications (Admin)
  getPendingApplications: async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Recruitment fetch error:", error);
      return []; // Return empty array instead of throwing to prevent breaking ApprovalHub
    }
    
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(d => d.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, whatsapp, location, education_level, employment_status').in('id', userIds);
      
      const profileMap = {};
      if (profilesData) {
        profilesData.forEach(p => profileMap[p.id] = p);
      }
      
      data.forEach(app => {
        app.profiles = profileMap[app.user_id] || {};
      });
    }

    return data || [];
  },

  // Update application status
  updateApplicationStatus: async (applicationId, newStatus) => {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) throw error;
    return data;
  }
};
