'use client';
import React, { useState, useEffect } from 'react';
import { Briefcase, Building, Landmark, ExternalLink, Loader } from 'lucide-react';
import { dataService } from '../../services/dataService';

const UnifiedJobsWidget = () => {
  const [activeTab, setActiveTab] = useState('Govt');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const data = await dataService.fetchJobs();
        setJobs(data || []);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)' }}><Loader className="spin" size={24} style={{ margin: '0 auto 8px auto' }}/>Loading Job Feeds...</div>;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
      
      {/* Header instead of tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--tech-cyan)',
        fontWeight: 'bold',
        gap: '8px'
      }}>
        <Briefcase size={18} /> வேலைவாய்ப்புகள் / Live Jobs ({jobs.length})
      </div>

      {/* Jobs List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
        {jobs.length === 0 ? (
          <div style={{ color: 'var(--cool-gray)', textAlign: 'center', padding: '20px' }}>இந்தப் பிரிவில் வேலைவாய்ப்புகள் எதுவும் இல்லை (No jobs available).</div>
        ) : (
          jobs.map((job, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '3px solid var(--tech-cyan)' }}>
              <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', lineHeight: '1.4', marginBottom: '8px' }}>
                {job.JobTitle}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--cool-gray)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {job.Category} • {job.Location}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {job.DateAdded && <span style={{ fontSize: '10px', color: 'var(--cool-gray)' }}>{job.DateAdded}</span>}
                  {job.ApplyLink && (
                    <a href={job.ApplyLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tech-cyan)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      Apply Now <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '8px 16px', fontSize: '10px', color: 'var(--cool-gray)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Powered by Live Job Feeds</span>
        <span>Auto-syncs daily</span>
      </div>

    </div>
  );
};

export default UnifiedJobsWidget;
