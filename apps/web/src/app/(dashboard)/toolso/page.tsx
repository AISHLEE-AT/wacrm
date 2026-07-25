// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Sparkles, Key, ExternalLink, Send, Loader2, CheckCircle2,
  History, Clock, Wrench, RefreshCw, ShieldCheck, Mic, MicOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { buildAishleeIframeUrl } from '@/lib/aishlee-sso';

/* ─────────────────────────────────────────────
   TAB IDs
───────────────────────────────────────────── */
type ActiveTab = 'gemini' | 'toolso';

/* ─────────────────────────────────────────────
   GEMINI AI SECTION  (merged from /ai-assistant)
───────────────────────────────────────────── */
function GeminiAiPanel({ user, profile }: { user: any; profile: any }) {
  const supabase = createClient();
  const [apiKey, setApiKey]         = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [prompt, setPrompt]         = useState('');
  const [mode, setMode]             = useState<'Agri' | 'Tutor' | 'Business'>('Agri');
  const [loading, setLoading]       = useState(false);
  const [response, setResponse]     = useState('');
  const [history, setHistory]       = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  /* Load saved key + history on mount */
  useEffect(() => {
    const saved =
      localStorage.getItem('fago_gemini_api_key') ||
      localStorage.getItem('gemini_api_key');
    if (saved) {
      setApiKey(saved);
      setIsConnected(true);
    }
    loadHistory();
  }, [user?.id]);

  async function loadHistory() {
    const localRaw = localStorage.getItem('fago_ai_history');
    let localItems: any[] = [];
    if (localRaw) {
      try { localItems = JSON.parse(localRaw); } catch (_) {}
    }

    try {
      const userPhone =
        profile?.phone || user?.phone || user?.email?.split('@')[0] || '';
      const { data } = await supabase
        .from('gemini_ai_history')
        .select('*')
        .or(
          `user_id.eq.${user?.id || '00000000-0000-0000-0000-000000000000'},phone.eq.${userPhone}`
        )
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const merged = [...data, ...localItems];
        const map = new Map<string, any>();
        merged.forEach(item => {
          const k = `${item.prompt}_${item.created_at}`;
          if (!map.has(k)) map.set(k, item);
        });
        const deduped = Array.from(map.values());
        setHistory(deduped);
        localStorage.setItem('fago_ai_history', JSON.stringify(deduped.slice(0, 50)));
        return;
      }
    } catch (_) {}

    setHistory(localItems);
  }

  const saveKey = (key: string) => {
    const clean = key.trim();
    if (!clean) return;
    localStorage.setItem('fago_gemini_api_key', clean);
    localStorage.setItem('gemini_api_key', clean);
    setApiKey(clean);
    setIsConnected(true);
  };

  const askGemini = async () => {
    if (!prompt.trim() || !apiKey) return;
    setLoading(true);
    setResponse('');

    const instructions = {
      Agri:     'You are FAGO Agri AI Doctor in Tamil Nadu. Answer in clear, friendly Tamil with organic farming remedies, pest control, and mandi price advice.',
      Tutor:    'You are TeachO AI Tutor in Tamil Nadu. Answer TNPSC, TN Board 11th/12th, and competitive exam questions step-by-step with Tamil explanations.',
      Business: 'You are FAGO Business AI Assistant. Help write polite WhatsApp messages and business communications in Tamil & English.',
    };

    const fullPrompt = `${instructions[mode]}\n\nQuestion: ${prompt}`;
    const models = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
    ];

    let successText = '';
    let lastError   = '';

    for (const modelName of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
          }
        );
        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          successText = data.candidates[0].content.parts[0].text;
          break;
        } else if (data.error?.message) {
          lastError = data.error.message;
        }
      } catch (err) {
        lastError = String(err);
      }
    }

    if (successText) {
      setResponse(successText);
      const newItem = {
        id:         Date.now().toString(),
        mode,
        prompt:     prompt.trim(),
        response:   successText,
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...history];
      setHistory(updated);
      localStorage.setItem('fago_ai_history', JSON.stringify(updated.slice(0, 50)));

      try {
        const userPhone =
          profile?.phone || user?.phone || user?.email?.split('@')[0] || '';
        await supabase.from('gemini_ai_history').insert({
          user_id:  user?.id || null,
          phone:    userPhone,
          mode,
          prompt:   prompt.trim(),
          response: successText,
        });
      } catch (_) {}
    } else {
      setResponse(`❌ API Error: ${lastError || 'Check your Gemini API Key or try again.'}`);
    }

    setLoading(false);
  };

  /* Voice input for the prompt */
  const toggleVoice = () => {
    if (isListening) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice search not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang             = 'ta-IN';
    rec.interimResults   = false;
    rec.maxAlternatives  = 1;
    rec.onstart          = () => setIsListening(true);
    rec.onresult         = (e: any) => {
      const text = e.results[0][0].transcript;
      setPrompt(prev => prev + (prev ? ' ' : '') + text);
    };
    rec.onerror          = () => setIsListening(false);
    rec.onend            = () => setIsListening(false);
    rec.start();
  };

  const MODES = [
    { id: 'Agri',     label: '🌾 பயிர் மருத்துவர்',      sub: 'Agri AI Doctor' },
    { id: 'Tutor',    label: '📚 TeachO AI ஆசான்',        sub: 'Exam Tutor' },
    { id: 'Business', label: '💬 WhatsApp AI',             sub: 'Business Assistant' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* API Key Banner */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Key className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <h3 className="text-sm font-bold text-white">
                {isConnected ? 'Google Gemini AI Connected ✅' : 'Connect Your Free Gemini API Key'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isConnected
                  ? 'Gemini 2.5 / 2.0 Flash Active • 100% Free Unlimited'
                  : 'Get free key in 1-tap from Google AI Studio'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            )}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-[11px] flex items-center gap-1.5 hover:opacity-90 transition"
            >
              Auto-Get Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {!isConnected && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Paste Gemini API Key (AIzaSy...)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey(apiKey)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => saveKey(apiKey)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex flex-col items-start gap-0.5 ${
              mode === m.id
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>{m.label}</span>
            <span className={`text-[10px] font-normal ${mode === m.id ? 'text-emerald-100' : 'text-slate-500'}`}>
              {m.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Query & Response */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card/40 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
            <div className="flex gap-2 items-start">
              <textarea
                ref={promptRef}
                rows={4}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) askGemini(); }}
                placeholder={
                  mode === 'Agri'
                    ? 'கேள்வி கேளுங்கள் (எ.கா: தக்காளி இலையில் மஞ்சள் புள்ளி வந்தால் என்ன இயற்கை மருந்து தெளிக்க வேண்டும்?)'
                    : mode === 'Tutor'
                    ? 'கேள்வி கேளுங்கள் (எ.கா: TNPSC குரூப் 4 தேர்வுக்கான தமிழ் இலக்கணக் குறிப்புகள்)'
                    : 'WhatsApp-ல் அனுப்ப வேண்டிய message உதவி கேளுங்கள்...'
                }
                className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
              {/* Voice input button */}
              <button
                onClick={toggleVoice}
                title={isListening ? 'Listening...' : 'Voice Input (Tamil)'}
                className={`mt-1 p-3 rounded-xl border transition flex-shrink-0 ${
                  isListening
                    ? 'bg-emerald-500 border-emerald-300 text-black animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={askGemini}
              disabled={loading || !isConnected}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> AI சிந்தித்துக் கொண்டிருக்கிறது...</>
              ) : (
                <><Send className="w-4 h-4" /> Gemini AI-யிடம் கேளுங்கள் (Ctrl+Enter)</>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Powered by Google Gemini 2.5 Flash • Free • No limits
            </p>
          </div>

          {/* Response */}
          {response && (
            <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" /> Gemini AI பதில் (Response):
              </div>
              <div className="p-4 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            AI வரலாறு ({history.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {history.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">
                No history yet. Ask your first question!
              </p>
            )}
            {history.map((h, idx) => (
              <button
                key={h.id || idx}
                onClick={() => { setPrompt(h.prompt); setResponse(h.response); setMode(h.mode || 'Agri'); }}
                className="w-full text-left p-3 rounded-xl bg-card/40 border border-white/10 space-y-1 text-xs backdrop-blur-md hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">{h.mode || 'Agri'}</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(h.created_at).toLocaleDateString('ta-IN')}
                  </span>
                </div>
                <p className="font-bold text-white line-clamp-2">Q: {h.prompt}</p>
                <p className="text-slate-400 line-clamp-2 border-t border-white/5 pt-1">
                  A: {h.response}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOOLSO IFRAME SECTION  (existing /toolso embed)
───────────────────────────────────────────── */
function ToolsOPanel({ user, profile }: { user: any; profile: any }) {
  const supabase = createClient();
  // null = session not resolved yet, string = ready to embed
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // ⚡ Guard: wait until auth resolves before building URL.
    // Without this the iframe loads with phone='' → guest_user in aishlee-web.
    if (user === undefined) return;

    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const geminiKey =
          localStorage.getItem('fago_gemini_api_key') ||
          localStorage.getItem('gemini_api_key') || '';
        setIframeUrl(
          buildAishleeIframeUrl('toolso', user, profile, session,
            geminiKey ? { gemini_api_key: geminiKey } : {}
          )
        );
      } catch (err) {
        console.error('ToolsO SSO sync error:', err);
        setIframeUrl('https://thamizhan.vercel.app/toolso');
      }
    }
    syncSession();
  }, [user, profile]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-card/60 border border-white/10 px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Aishlee ToolsO • கருவிகள் தொகுப்பு</p>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              LetterPDF AI • Finance Tracker • Agri Ledger • Crop Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSO Connected
          </span>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition"
          >
            Full Screen <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ minHeight: '600px' }}>
        {!iframeUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500" style={{ minHeight: '600px' }}>
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Connecting to Aishlee ToolsO…</p>
            <p className="text-xs text-slate-600">Authenticating your session</p>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={iframeUrl}
            title="Aishlee ToolsO Module"
            className="w-full h-full border-0"
            allow="camera *; microphone *; geolocation *; clipboard-write *; encrypted-media *; autoplay *"
            style={{ minHeight: '600px' }}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE — Unified AI & Tools Hub
───────────────────────────────────────────── */
export default function AiToolsHubPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('gemini');

  /* Allow deep-linking via ?tab=toolso or ?tab=gemini */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'toolso') setActiveTab('toolso');
      else if (tab === 'ai' || tab === 'gemini') setActiveTab('gemini');
    }
  }, []);

  const TABS = [
    {
      id:    'gemini' as ActiveTab,
      icon:  Bot,
      label: '🤖 Gemini AI',
      sub:   'Agri • Tutor • Business',
      color: 'emerald',
    },
    {
      id:    'toolso' as ActiveTab,
      icon:  Wrench,
      label: '🛠️ ToolsO Apps',
      sub:   'LetterPDF • Finance • Agri',
      color: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col">
      {/* ── Page Header ───────────────────────────────── */}
      <div className="px-4 md:px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-3">
            {/* Dual icon badge */}
            <div className="relative">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                <Bot className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-500/90 rounded-lg border border-indigo-400/40">
                <Wrench className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-white">
                AI & Tools Hub • தமிழ் AI + கருவிகள்
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gemini AI Assistant + ToolsO Apps from Aishlee Web • All-in-one
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ─────────────────────────────── */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all -mb-px ${
                  isActive
                    ? tab.color === 'emerald'
                      ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                      : 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="flex flex-col items-start leading-none gap-0.5">
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-normal ${isActive ? 'opacity-80' : 'text-slate-500'}`}>
                    {tab.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────── */}
      <div className={`flex-1 px-4 md:px-6 py-5 ${activeTab === 'toolso' ? 'flex flex-col' : ''}`}>
        {activeTab === 'gemini' && (
          <GeminiAiPanel user={user} profile={profile} />
        )}
        {activeTab === 'toolso' && (
          <ToolsOPanel user={user} profile={profile} />
        )}
      </div>
    </div>
  );
}
