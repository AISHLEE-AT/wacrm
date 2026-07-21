// @ts-nocheck
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, Sparkles, Settings, FileText, Download, Share2, History, Trash2, Camera, Link as LinkIcon, HelpCircle, FileType, Mic } from 'lucide-react';
import { geminiService } from '@/aishlee/services/geminiService';
import { lmsService } from '@/aishlee/services/lmsService';
import { EXAM_CATEGORIES } from '@/aishlee/constants/exams';
import { useApp } from '@/aishlee/context/AppProvider';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FinanceTracker from '@/aishlee/components/FinanceTracker';
import AgriLedger from '@/aishlee/components/AgriLedger';
import WhatsAppSevai from '@/aishlee/components/WhatsAppSevai';
import LetterPdfAi from '@/aishlee/components/LetterPdfAi';

const ToolsO = () => {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  
  const [activeTab, setActiveTab] = useState('Crop Disease Analysis'); // Crop Disease Analysis, TN WhatsApp Certificates, TN E-Sevai Chat, Info Hub, Quiz Creator, Notes Maker
  const [language, setLanguage] = useState('Tamil');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [history, setHistory] = useState([]);
  
  // Specific states for Quiz/Notes/E-Sevai
  const [classLevel, setClassLevel] = useState('10th Grade');
  const [eSevaiProfile, setESevaiProfile] = useState('General');
  
  // Ref for exporting
  const resultRef = useRef(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachments(prev => [...prev, {
        data: reader.result.split(',')[1],
        mimeType: file.type,
        name: file.name
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset
  };

  const handleLinkClick = () => {
    const url = prompt('Enter YouTube Link or Website URL:');
    if (url) {
      setInput((prev) => prev + (prev ? '\n' : '') + url);
    }
  };

  const [isListening, setIsListening] = useState(false);
  
  const toggleVoiceSearch = () => {
    if (isListening) return; // Wait for it to stop naturally or handle stopping

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice search is not supported in this browser.", 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const saved = localStorage.getItem('ai_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (query, result, type) => {
    const newEntry = { id: Date.now(), query, result, type, timestamp: new Date().toLocaleString() };
    const newHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('ai_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_history');
  };

  const handleGenerate = async () => {
    if (!input.trim() && attachments.length === 0) {
      return showToast("Please provide some text or upload a file first.", 'error');
    }
    setLoading(true);
    setOutput('');
    
    try {
      const userKey = localStorage.getItem('gemini_api_key');
      let result = '';

      if (activeTab === 'Info Hub') {
        result = await geminiService.askInformationHub(input, language, userKey);
      } else if (activeTab === 'Quiz Creator') {
        result = await geminiService.generateInteractiveQuiz(input, classLevel, language, 10, 'Multiple Choice', 'Medium', '', userKey, attachments);
      } else if (activeTab === 'Notes Maker') {
        result = await geminiService.generateNotes(input, language, classLevel, userKey, attachments);
      } else if (activeTab === 'TN E-Sevai Chat') {
        result = await geminiService.askESevaiAssistant(input, eSevaiProfile, language, userKey);
      } else if (activeTab === 'Crop Disease Analysis') {
        // Just call a generic multimodal prompt for agriculture
        result = await geminiService.askAgriculturalExpert(input, language, userKey, attachments);
      }
      
      setOutput(result);
      saveToHistory(input, result, activeTab);
    } catch (error) {
      console.error(error);
      setOutput(`⚠️ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps= pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Thamizha_${activeTab.replace(' ', '_')}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `THAMIZHA AI - ${activeTab}`,
          text: output,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      showToast("Sharing is not supported on this browser. Try downloading as PDF.", 'error');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*THAMIZHA AI - ${activeTab}*\n\n${output}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePublishToLMS = async () => {
    if (!publishTitle.trim()) {
      showToast("Please enter a Course/Module Title before publishing.", 'error');
      return;
    }
    setPublishing(true);
    try {
      await lmsService.publishCourse({
        adminId: currentUser.id,
        title: publishTitle,
        content: output,
        type: activeTab,
        classLevel,
        language
      });
      showToast("Success! Content permanently published to the LMS Academy.", 'success');
      setPublishTitle('');
    } catch (err) {
      console.error(err);
      showToast(`Failed to publish: ${err.message}`, 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', paddingBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bot color="var(--tech-cyan)" size={32} />
          <div>
            <h1 style={{ fontSize: '24px', margin: 0 }} className="gradient-text-cyan">Aishlee Tools</h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>News, Quizzes, and Notes powered by Gemini</p>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Language:</span>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', fontWeight: 'bold' }}
            >
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['Crop Disease Analysis', 'TN WhatsApp Certificates', 'TN E-Sevai Chat', 'Info Hub', 'Quiz Creator', 'Notes Maker', 'Finance Tracker', 'Agri Ledger', 'LetterPDF AI'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'var(--tech-cyan)' : 'transparent',
              color: activeTab === tab ? 'black' : 'var(--cool-gray)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Finance Tracker' ? (
        <FinanceTracker />
      ) : activeTab === 'Agri Ledger' ? (
        <AgriLedger />
      ) : activeTab === 'TN WhatsApp Certificates' ? (
        <WhatsAppSevai />
      ) : activeTab === 'LetterPDF AI' ? (
        <LetterPdfAi />
      ) : (
      <div className="responsive-grid">
        
        {/* Left Column: Editor & Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Input Panel */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {activeTab === 'TN E-Sevai Chat' && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--cool-gray)', display: 'block', marginBottom: '6px' }}>Select Demographic Profile</label>
                  <select 
                    className="input-field" 
                    value={eSevaiProfile} 
                    onChange={e => setESevaiProfile(e.target.value)}
                  >
                    <option value="General">General / All</option>
                    <option value="Farmer / Vivasayi">Farmer (Vivasayi)</option>
                    <option value="Student">Student</option>
                    <option value="Women">Women</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Entrepreneur / MSME">Entrepreneur / MSME</option>
                  </select>
                </div>
              </div>
            )}

            {(activeTab === 'Quiz Creator' || activeTab === 'Notes Maker') && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--cool-gray)', display: 'block', marginBottom: '6px' }}>Target Audience</label>
                  <select 
                    className="input-field" 
                    value={classLevel} 
                    onChange={e => setClassLevel(e.target.value)}
                  >
                    {EXAM_CATEGORIES.map((category, idx) => (
                      <optgroup key={idx} label={category.group}>
                        {category.exams.map((exam, examIdx) => (
                          <option key={examIdx} value={exam}>{exam}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {(activeTab === 'Quiz Creator' || activeTab === 'Notes Maker' || activeTab === 'Crop Disease Analysis') && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100%', paddingBottom: '4px' }}>
                  <button className="btn-outline" style={{ padding: '8px' }} title="Upload File" onClick={() => fileInputRef.current?.click()}><FileText size={18} /></button>
                  <button className="btn-outline" style={{ padding: '8px' }} title="Scan from Camera" onClick={() => cameraInputRef.current?.click()}><Camera size={18} /></button>
                  {activeTab !== 'Crop Disease Analysis' && (
                    <button className="btn-outline" style={{ padding: '8px' }} title="Paste YouTube Link" onClick={handleLinkClick}><LinkIcon size={18} /></button>
                  )}
                  
                  <input type="file" accept="application/pdf,image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: 'var(--cool-gray)', display: 'block', marginBottom: '6px' }}>
                {activeTab === 'Info Hub' ? 'What do you want to know? (News, Weather, Traffic, Health)' 
                  : activeTab === 'TN E-Sevai Chat' ? 'What scheme or document are you looking for?' 
                  : activeTab === 'Crop Disease Analysis' ? 'Describe the issue or ask a question about your crop (or use Voice Search/Camera):'
                  : 'Paste text, links, or describe the topic here:'}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <textarea 
                  className="input-field" 
                  style={{ flex: 1 }}
                  rows={4} 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  placeholder={activeTab === 'Info Hub' ? "e.g. சென்னையில் இன்றைய weather எப்படி?" 
                    : activeTab === 'TN E-Sevai Chat' ? "e.g. How to apply for Patta name transfer?" 
                    : activeTab === 'Crop Disease Analysis' ? "e.g. My tomato leaves are turning yellow, what should I do?"
                    : "Paste syllabus or youtube transcript here..."}
                />
                <button 
                  className="btn-outline" 
                  onClick={toggleVoiceSearch} 
                  title="Voice Search"
                  style={{ padding: '16px', background: isListening ? 'var(--tech-teal)' : 'transparent', color: isListening ? 'var(--deep-midnight)' : 'white' }}
                >
                  <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
                </button>
              </div>
              {attachments.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {attachments.map((att, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white' }}>
                      <span>{att.name}</span>
                      <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="btn-primary" 
              onClick={handleGenerate} 
              disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '14px' }}
            >
              {loading ? <Sparkles className="animate-pulse" size={20} /> : <Send size={20} />}
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{loading ? 'AI is working...' : `Generate ${activeTab}`}</span>
            </button>
          </div>

          {/* Result Panel */}
          {output && (
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--tech-cyan)" /> Generated Result
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  
                  {isAdmin && activeTab !== 'Info Hub' && activeTab !== 'Crop Disease Analysis' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '8px', border: '1px solid #10B981' }}>
                      <input 
                        type="text" 
                        placeholder="Course Title..." 
                        value={publishTitle}
                        onChange={e => setPublishTitle(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '120px', fontSize: '12px' }}
                      />
                      <button onClick={handlePublishToLMS} disabled={publishing} style={{ background: '#10B981', color: 'black', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {publishing ? 'Publishing...' : 'Publish to LMS'}
                      </button>
                    </div>
                  )}

                  <button onClick={handleWhatsAppShare} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px', background: '#25D366' }}><Share2 size={14} /> WhatsApp</button>
                  <button onClick={handleShare} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px' }}><Share2 size={14} /> Share</button>
                  <button onClick={handleExportPDF} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px' }}><Download size={14} /> PDF</button>
                </div>
              </div>
              <div ref={resultRef} className="markdown-body" style={{ padding: '24px', lineHeight: '1.6', fontSize: '15px', color: 'rgba(255,255,255,0.9)', background: '#0f172a' }}>
                {activeTab === 'Quiz Creator' && output.trim().startsWith('[') ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(() => {
                      try {
                        const data = JSON.parse(output);
                        return data.map((q, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--tech-cyan)' }}>{idx + 1}. {q.question}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {q.options && q.options.map((opt, oIdx) => (
                                <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <input type="radio" name={`q_${idx}`} value={opt} style={{ accentColor: 'var(--tech-cyan)' }} />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                            <div style={{ marginTop: '16px', fontSize: '14px', color: '#10B981', display: 'none', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px' }} id={`ans_${idx}`}>
                              <strong>Correct Answer:</strong> {q.correctAnswer} <br/>
                              <span style={{ color: 'var(--cool-gray)', display: 'block', marginTop: '8px' }}>{q.explanation}</span>
                            </div>
                            <button 
                              onClick={() => {
                                const el = document.getElementById(`ans_${idx}`);
                                el.style.display = el.style.display === 'none' ? 'block' : 'none';
                              }}
                              style={{ marginTop: '16px', background: 'transparent', border: '1px solid var(--tech-cyan)', color: 'var(--tech-cyan)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                            >
                              Toggle Answer
                            </button>
                          </div>
                        ));
                      } catch(e) {
                        return <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>;
                      }
                    })()}
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {output}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: History */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} /> History
            </h3>
            {history.length > 0 && (
              <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Clear History">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div style={{ color: 'var(--cool-gray)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No recent AI requests.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setInput(item.query); setOutput(item.result); setActiveTab(item.type); }}
                  style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--tech-cyan)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--tech-cyan)', textTransform: 'uppercase', fontWeight: 'bold' }}>{item.type}</span>
                    <span style={{ fontSize: '10px', color: 'var(--cool-gray)' }}>{item.timestamp.split(',')[0]}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.query}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      )}

      {/* Custom Toast Notification */}
      {toast.show && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', borderRadius: '14px', zIndex: 99999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : 'var(--tech-cyan)',
          color: '#fff', fontWeight: '700', fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease-out',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
};

export default ToolsO;

