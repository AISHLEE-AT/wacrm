// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Key, ExternalLink, Send, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'Agri' | 'Tutor' | 'Business'>('Agri');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fago_gemini_api_key');
    if (saved) {
      setApiKey(saved);
      setIsConnected(true);
    }
  }, []);

  const saveKey = (key: string) => {
    const clean = key.trim();
    if (!clean) return;
    localStorage.setItem('fago_gemini_api_key', clean);
    setApiKey(clean);
    setIsConnected(true);
  };

  const askGemini = async () => {
    if (!prompt.trim() || !apiKey) return;
    setLoading(true);
    setResponse('');

    const instructions = {
      Agri: 'You are FAGO Agri AI Doctor in Tamil Nadu. Answer in clear, friendly Tamil with organic farming remedies, pest control, and mandi price advice.',
      Tutor: 'You are TeachO AI Tutor in Tamil Nadu. Answer TNPSC, TN Board 11th/12th, and competitive exam questions step-by-step with Tamil explanations.',
      Business: 'You are FAGO Business AI Assistant. Help write polite WhatsApp messages and business communications in Tamil & English.'
    };

    const fullPrompt = `${instructions[mode]}\n\nQuestion: ${prompt}`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || 'பதில் பெறப்படவில்லை.');
      } else {
        setResponse(`❌ Error: ${data.error?.message || 'Invalid API Key'}`);
      }
    } catch (err) {
      setResponse(`❌ Connection Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              FAGO Gemini AI Assistant • தமிழ் AI உதவி மையம்
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Connect your free Google Gemini API Key for 100% free Agri, Exam & Business AI
            </p>
          </div>
        </div>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition self-start md:self-auto"
        >
          Auto-Get Key (Google AI Studio) <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Key Status Banner */}
      <div className={`p-6 rounded-3xl border backdrop-blur-md transition-all ${
        isConnected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className={`w-6 h-6 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <h3 className="text-base font-bold text-white">
                {isConnected ? 'Google Gemini AI Connected' : 'Connect Your Free Gemini API Key'}
              </h3>
              <p className="text-xs text-slate-400">
                {isConnected ? 'Gemini 1.5 Flash Active • 100% Free Unlimited Usage' : 'Get your key in 1-tap from Google AI Studio and paste below'}
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          )}
        </div>

        {!isConnected && (
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder="Paste Google Gemini API Key (AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => saveKey(apiKey)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
            >
              Connect Key
            </button>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-3">
        {[
          { id: 'Agri', label: '🌾 பயிர் மருத்துவர் (Agri AI Doctor)' },
          { id: 'Tutor', label: '📚 TeachO AI ஆசான் (Exam Tutor)' },
          { id: 'Business', label: '💬 WhatsApp AI Assistant' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
              mode === item.id
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Query Input Box */}
      <div className="bg-card/40 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'Agri'
              ? 'கேள்வி கேளுங்கள் (எ.கா: தக்காளி இலையில் மஞ்சள் புள்ளி வந்தால் என்ன இயற்கை மருந்து தெளிக்க வேண்டும்?)'
              : 'கேள்வி கேளுங்கள் (எ.கா: TNPSC குரூப் 4 தேர்வுக்கான தமிழ் இலக்கணக் குறிப்புகள்)'
          }
          className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
        />

        <button
          onClick={askGemini}
          disabled={loading || !isConnected}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> AI சிந்தித்துக் கொண்டிருக்கிறது...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Gemini AI-யிடம் கேளுங்கள்
            </>
          )}
        </button>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-[#0F172A] border border-emerald-500/30 rounded-3xl p-6 space-y-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" /> Gemini AI பதில் (Response):
          </div>
          <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
