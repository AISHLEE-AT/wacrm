'use client';
import React, { useState } from 'react';
import { Send, CheckCircle, Smartphone, FileText, ArrowRight, ShieldCheck, Copy, Loader, ExternalLink } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function WhatsAppSevai() {
  const [selectedCert, setSelectedCert] = useState('');
  const [checklist, setChecklist] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const certificates = [
    'Community Certificate',
    'Income Certificate',
    'Nativity Certificate',
    'First Graduate Certificate',
    'Widow Certificate',
    'Deserted Woman Certificate',
    'Legal Heir Certificate',
    'Agricultural Income Certificate',
    'Small / Marginal Farmer Certificate'
  ];

  const handleGenerateChecklist = async () => {
    if (!selectedCert) return alert("Please select a certificate to apply for.");
    setLoading(true);
    setChecklist('');
    try {
      const userKey = localStorage.getItem('gemini_api_key');
      const prompt = `Provide a concise, bulleted checklist of the exact documents a citizen needs to have ready on their phone (as photos/PDFs) before applying for a "${selectedCert}" in Tamil Nadu via the TNeGA WhatsApp bot. Respond in a mix of Tamil and English for easy understanding. Do not include long paragraphs, just the checklist.`;
      
      const result = await geminiService.executeWithFallback(prompt, userKey);
      setChecklist(await result.text());
    } catch (err) {
      setChecklist('⚠️ Failed to generate checklist. Please ensure your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('Hi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const officialNumber = "919344532738";
  const whatsappUrl = `https://wa.me/${(String(officialNumber).replace(/\D/g, '').length === 10 ? '91' + String(officialNumber).replace(/\D/g, '') : String(officialNumber).replace(/\D/g, ''))}?text=Hi`;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Smartphone size={40} color="#10B981" />
          <div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '22px' }}>TNeGA WhatsApp e-Sevai Gateway</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--cool-gray)', fontSize: '14px' }}>
              Apply for 50+ certificates directly via the official Govt of Tamil Nadu WhatsApp Bot.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px', color: '#10B981', fontSize: '13px' }}>
          <ShieldCheck size={18} />
          <strong>Verified Official Number:</strong> +91 78452 52525
        </div>
      </div>

      {/* Step 1: Prep */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--tech-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'var(--tech-cyan)', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>1</span>
          Prepare Your Documents
        </h3>
        <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '16px' }}>
          Before messaging the bot, ensure you have photos of the required documents ready on your phone. Select a certificate below to generate an AI checklist.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            value={selectedCert} 
            onChange={e => setSelectedCert(e.target.value)}
            style={{ flex: 1, minWidth: '250px' }}
          >
            <option value="" disabled>Select Certificate Type...</option>
            {certificates.map(cert => <option key={cert} value={cert}>{cert}</option>)}
          </select>
          <button 
            className="btn-outline" 
            onClick={handleGenerateChecklist}
            disabled={!selectedCert || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? <Loader className="spin" size={18} /> : <FileText size={18} />}
            Get AI Checklist
          </button>
        </div>

        {checklist && (
          <div className="markdown-body" style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '3px solid var(--tech-cyan)', fontSize: '14px' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{checklist}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Step 2: Message Bot */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#10B981', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>2</span>
          Message the Bot
        </h3>
        <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '16px' }}>
          The bot is menu-driven. You must start the conversation by simply saying <strong>"Hi"</strong> or <strong>"Vanakkam"</strong>. The bot will reply with a menu to select your certificate.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: 'var(--cool-gray)', display: 'block', marginBottom: '4px' }}>Message to Send:</label>
            <div style={{ fontSize: '18px', color: 'white', fontWeight: 'bold' }}>Hi</div>
          </div>
          <button onClick={handleCopy} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {copied ? <CheckCircle size={16} color="#10B981" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
        </div>

        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', background: '#10B981', color: 'black', border: 'none' }}
          >
            <Send size={24} />
            Launch Official WhatsApp Bot
            <ExternalLink size={18} style={{ opacity: 0.7 }} />
          </button>
        </a>
      </div>

    </div>
  );
}
