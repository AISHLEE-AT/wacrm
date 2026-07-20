'use client';
import React, { useState } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { geminiService } from '@/aishlee/services/geminiService';
import { ArrowLeft, BookOpen, Brain, Download, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';

export default function AiNotesGenerator() {
  const { currentUser } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [courseName, setCourseName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [category, setCategory] = useState('TNPSC Group 1');
  const [language, setLanguage] = useState('English');
  
  const [generatedContent, setGeneratedContent] = useState('');

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  if (!isAdmin) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Access Denied. Admins only.</div>;
  }

  const handleGenerate = async () => {
    if (!courseName.trim() || !topicName.trim()) {
      return setError('Please enter both Course Name and Topic Name.');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const content = await geminiService.generateMicroContent(
        courseName, 
        topicName, 
        category, 
        language, 
        apiKey || ''
      );
      setGeneratedContent(content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent.trim()) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.text(`${courseName} - ${topicName}`, 15, 20);
    
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(generatedContent, 180);
    doc.text(splitText, 15, 30);
    
    doc.save(`${topicName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/lms')} className="btn-outline" style={{ border: 'none', padding: 0 }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>AI Topic-wise Notes Generator</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Generate detailed notes for specific syllabus topics</p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Course / Subject Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Indian Polity" 
              value={courseName} 
              onChange={e => setCourseName(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Specific Topic Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Fundamental Rights (Articles 12-35)" 
              value={topicName} 
              onChange={e => setTopicName(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Target Audience / Category</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., TNPSC Group 1, UPSC" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Language</label>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="btn-primary" 
            style={{ marginTop: '8px', padding: '16px', fontSize: '16px', background: 'var(--tech-cyan)' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader className="spin" size={20} />
                Generating AI Notes...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Brain size={20} />
                Generate Topic Notes
              </div>
            )}
          </button>
        </div>
      </div>

      {generatedContent && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: 'white', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--tech-green)" />
              Generated Notes
            </h2>
            <button onClick={handleDownloadPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              <Download size={16} /> Export PDF
            </button>
          </div>
          <textarea 
            className="input-field" 
            style={{ height: '400px', width: '100%', fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
