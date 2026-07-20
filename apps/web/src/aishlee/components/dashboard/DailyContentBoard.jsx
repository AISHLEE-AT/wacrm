'use client';
import React from 'react';
import { BookOpen, Quote, HelpCircle } from 'lucide-react';

const DailyContentBoard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #A855F7', display: 'flex', flexDirection: 'column', gap: '20px', height: '420px', overflowY: 'auto' }}>
      
      {/* Thirukkural */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
          <BookOpen size={16} /> தினசரி திருக்குறள் (Daily Thirukkural)
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
          {data.thirukkural}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--cool-gray)', marginTop: '6px', fontStyle: 'italic' }}>
          பொருள் (Meaning): {data.thirukkuralMeaning}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

      {/* Quote */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tech-cyan)', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
          <Quote size={16} /> இன்றைய பொன்மொழி (Quote of the Day)
        </div>
        <div style={{ fontSize: '15px', color: 'white', fontStyle: 'italic' }}>
          "{data.quote}"
        </div>
        <div style={{ fontSize: '12px', color: 'var(--tech-cyan)', marginTop: '4px', fontWeight: 'bold' }}>
          — {data.quoteAuthor}
        </div>
      </div>

    </div>
  );
};

export default DailyContentBoard;
