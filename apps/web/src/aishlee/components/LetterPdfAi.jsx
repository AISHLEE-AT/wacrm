'use client';
import React, { useState, useRef } from 'react';
import { Send, Sparkles, Download, Share2, Mic, FileText, Mail, MapPin } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const VoiceInput = ({ label, icon: Icon, value, onChange, placeholder, language }) => {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceSearch = () => {
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      onChange(value + (value ? ' ' : '') + speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '13px', color: 'var(--cool-gray)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 'bold' }}>
        <Icon size={16} /> {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <textarea 
          className="input-field" 
          style={{ flex: 1, minHeight: '80px', padding: '12px', fontSize: '14px' }}
          rows={3} 
          value={value} 
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button 
          className="btn-outline" 
          onClick={toggleVoiceSearch} 
          title={`Voice Input for ${label}`}
          style={{ 
            padding: '16px', 
            background: isListening ? 'var(--tech-teal)' : 'transparent', 
            color: isListening ? 'var(--deep-midnight)' : 'white',
            borderColor: isListening ? 'transparent' : 'var(--surface-border)'
          }}
        >
          <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
};

const LetterPdfAi = () => {
  const [language, setLanguage] = useState('English');
  const [aim, setAim] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const resultRef = useRef(null);

  const handleGenerate = async () => {
    if (!aim.trim()) {
      return alert("Please provide the Core Need/Aim of the letter.");
    }
    
    setLoading(true);
    setOutput('');
    
    try {
      const userKey = localStorage.getItem('gemini_api_key');
      const result = await geminiService.generateLetter(aim, toAddress, fromAddress, language, userKey);
      setOutput(result);
    } catch (error) {
      console.error(error);
      setOutput(`⚠️ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Letter_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error: ", error);
      alert("Failed to export PDF.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LetterPDF AI Generated Letter`,
          text: output,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert("Sharing is not supported on this browser. Try downloading as PDF.");
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(output);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="responsive-grid">
      {/* Left Column: Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }} className="gradient-text-cyan">
               <FileText size={20} /> Create Your Letter
             </h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Language:</span>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--surface-border)', padding: '4px 8px', borderRadius: '4px', outline: 'none', fontWeight: 'bold' }}
                >
                  <option value="English">English</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
             </div>
          </div>

          <VoiceInput 
            label="Core Need / Aim of the Letter *" 
            icon={Sparkles} 
            value={aim} 
            onChange={setAim} 
            placeholder={language === 'Tamil' ? "எ.கா: மருத்துவ விடுப்பு கோரி விண்ணப்பம்..." : "e.g. Leave application for 2 days due to fever..."}
            language={language}
          />

          <VoiceInput 
            label="To Address" 
            icon={Mail} 
            value={toAddress} 
            onChange={setToAddress} 
            placeholder={language === 'Tamil' ? "எ.கா: வகுப்பாசிரியர், 10ம் வகுப்பு..." : "e.g. The Principal, ABC School, Chennai..."}
            language={language}
          />

          <VoiceInput 
            label="From Address" 
            icon={MapPin} 
            value={fromAddress} 
            onChange={setFromAddress} 
            placeholder={language === 'Tamil' ? "எ.கா: மு. கபிலன், 10ம் வகுப்பு..." : "e.g. M. Kabilan, X Standard, 'A' Section..."}
            language={language}
          />

          <button 
            className="btn-primary" 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', marginTop: '8px' }}
          >
            {loading ? <Sparkles className="animate-pulse" size={20} /> : <Send size={20} />}
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{loading ? 'Crafting Letter...' : 'Generate Letter'}</span>
          </button>

        </div>
      </div>

      {/* Right Column: Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {output ? (
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--tech-cyan)" /> Letter Preview
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleWhatsAppShare} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px', background: '#25D366' }}><Share2 size={14} /> WhatsApp</button>
                <button onClick={handleShare} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px' }}><Share2 size={14} /> Share</button>
                <button onClick={handleExportPDF} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '6px' }}><Download size={14} /> PDF</button>
              </div>
            </div>
            
            {/* The A4-like container for the letter */}
            <div style={{ padding: '24px', background: '#e2e8f0', flex: 1, display: 'flex', justifyContent: 'center', overflowX: 'auto', overflowY: 'auto' }}>
                <div 
                  ref={resultRef} 
                  style={{ 
                    background: 'white', 
                    color: 'black',
                    padding: '20mm', // Standard 2cm margins
                    width: '210mm', // Fixed A4 width
                    minHeight: '297mm', // Fixed A4 height
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    lineHeight: '1.5', 
                    fontSize: '12pt',
                    fontFamily: '"Times New Roman", Times, serif',
                    flexShrink: 0
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: output }} />
                </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--cool-gray)', height: '100%', borderStyle: 'dashed' }}>
             <FileText size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
             <p style={{ margin: 0, textAlign: 'center' }}>Your generated letter will appear here, ready to be exported to PDF or shared.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LetterPdfAi;
