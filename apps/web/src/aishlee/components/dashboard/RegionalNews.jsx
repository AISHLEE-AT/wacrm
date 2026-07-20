'use client';
import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Flag, ExternalLink, Loader } from 'lucide-react';
import { dataService } from '../../services/dataService';

const RegionalNews = () => {
  const [activeTab, setActiveTab] = useState('tn');
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const data = await dataService.fetchNews();
        setNewsData(data);
      } catch (err) {
        console.error("Failed to load news", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)' }}><Loader className="spin" size={24} style={{ margin: '0 auto 8px auto' }}/>Loading News Feeds...</div>;
  if (!newsData) return null;

  const tabs = [
    { id: 'tn', label: `தமிழ்நாடு (${newsData.tn.length})`, icon: MapPin },
    { id: 'india', label: `இந்தியா (${newsData.india.length})`, icon: Flag },
    { id: 'world', label: `உலகம் (${newsData.world.length})`, icon: Globe }
  ];

  const activeNews = newsData[activeTab] || [];

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                color: isActive ? 'var(--tech-cyan)' : 'var(--cool-gray)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--tech-cyan)' : '2px solid transparent',
                padding: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* News List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
        {activeNews.length === 0 ? (
          <div style={{ color: 'var(--cool-gray)', textAlign: 'center', padding: '20px' }}>இந்த பிரிவில் செய்திகள் எதுவும் இல்லை (No news available).</div>
        ) : (
          activeNews.map((news, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '3px solid var(--tech-cyan)' }}>
              <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', lineHeight: '1.4', marginBottom: '8px' }}>
                {news.headline}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--cool-gray)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  மூலம் (Source): {news.source}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {news.date && <span style={{ fontSize: '10px', color: 'var(--cool-gray)' }}>{news.date}</span>}
                  {news.url && (
                    <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tech-cyan)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      மேலும் படிக்க <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '8px 16px', fontSize: '10px', color: 'var(--cool-gray)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Powered by Live RSS Feeds</span>
        <span>Auto-syncs every 12 Hours</span>
      </div>

    </div>
  );
};

export default RegionalNews;
