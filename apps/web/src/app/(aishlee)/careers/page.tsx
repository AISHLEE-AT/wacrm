// @ts-nocheck
'use client';
import React, { useState } from 'react';
import UnifiedJobsWidget from '@/aishlee/components/dashboard/UnifiedJobsWidget';
import { useApp } from '@/aishlee/context/AppProvider';
import { recruitmentService } from '@/aishlee/services/recruitmentService';
import { Briefcase, MapPin, IndianRupee, ShieldCheck, Mail, Send, CheckCircle, Search, Sparkles } from 'lucide-react';

export default function Careers() {
  const { currentUser } = useApp();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [resumeLink, setResumeLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const jobs = recruitmentService.getInternalJobs();

  // Group jobs by category
  const categories = [...new Set(jobs.map(j => j.category))];

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setSuccessMsg('');
    setCoverLetter('');
    setResumeLink('');
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) return alert("Please provide a brief cover letter.");
    
    setIsSubmitting(true);
    try {
      await recruitmentService.submitApplication(currentUser.id, selectedJob, coverLetter, resumeLink);
      setSuccessMsg("Application submitted successfully! Our HR team will review your profile shortly.");
      setTimeout(() => {
        setSelectedJob(null);
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', textAlign: 'left' }}>
      {/* Hero Section */}
      <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', marginBottom: '32px', borderTop: '4px solid var(--tech-teal)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(11,15,25,0) 100%)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
          Careers at <span style={{ color: 'var(--tech-teal)' }}>Aishlee Tech</span>
        </h1>
        <p style={{ color: 'var(--cool-gray)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Join our mission to empower Tamil Nadu through technology. We are looking for passionate individuals to join our core team. 
          Review the open positions below and apply directly!
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tech-cyan)', fontSize: '14px', fontWeight: 'bold' }}>
            <Mail size={18} /> hr@aishlee.com
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366', fontSize: '14px', fontWeight: 'bold' }}>
            <Search size={18} /> Direct Admin Screening
          </div>
        </div>
      </div>

      {/* External Live Job Feeds */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <Briefcase color="var(--tech-teal)" size={20} />
          </div>
          External Government & IT Jobs (Live Feed)
        </h2>
        <UnifiedJobsWidget />
      </div>

      {/* Job Listings by Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {categories.map(category => (
          <div key={category}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Briefcase color="var(--tech-cyan)" size={20} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', margin: 0 }}>{category}</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {jobs.filter(j => j.category === category).map(job => (
                <div key={job.id} className="glass-panel stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'default' }}>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{job.title}</h3>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: 'var(--cool-gray)', fontWeight: 'bold' }}>
                        {job.type}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--cool-gray)' }}>
                        <MapPin size={14} color="var(--tech-teal)" /> {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--cool-gray)' }}>
                        <IndianRupee size={14} color="var(--tech-gold)" /> {job.salary}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--tech-cyan)' }}>Requirements:</strong><br/>
                    {job.reqs}
                  </div>

                  <button 
                    onClick={() => handleApplyClick(job)}
                    className="btn-primary mt-auto" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--tech-cyan)', color: 'black' }}
                  >
                    <Send size={16} /> Apply Now
                  </button>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedJob(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
            >
              &times;
            </button>
            
            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={64} color="var(--tech-teal)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'white', marginBottom: '8px' }}>Application Sent!</h3>
                <p style={{ color: 'var(--cool-gray)', fontSize: '14px' }}>{successMsg}</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Apply for {selectedJob.title}</h2>
                <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '24px' }}>
                  Your profile details (Education, Location, WhatsApp) will be automatically attached to this application.
                </p>
                
                <form onSubmit={submitApplication}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--tech-cyan)' }}>
                      Why are you a good fit? (Cover Letter)
                    </label>
                    <textarea 
                      className="input-field"
                      rows="5"
                      value={coverLetter}
                      onChange={(e: any) => setCoverLetter(e.target.value)}
                      placeholder="Briefly explain your experience and why you want to join Aishlee Tech..."
                      style={{ width: '100%', resize: 'vertical' }}
                      required
                    ></textarea>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--tech-cyan)' }}>
                      Resume Link / LinkedIn Profile
                    </label>
                    <input 
                      type="url"
                      className="input-field"
                      value={resumeLink}
                      onChange={(e: any) => setResumeLink(e.target.value)}
                      placeholder="https://linkedin.com/in/... or Google Drive link"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setSelectedJob(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      {isSubmitting ? 'Submitting...' : <><Sparkles size={18} /> Submit Application</>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
