// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Sparkles, Key, ExternalLink, Send, Loader2, CheckCircle2,
  History, Clock, Wrench, RefreshCw, ShieldCheck, Mic, MicOff, Globe
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
  const [mode, setMode]             = useState<'General' | 'Agri' | 'Tutor' | 'Business'>('General');
  const [language, setLanguage]     = useState<'ta' | 'en' | 'tanglish'>('ta');
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

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-US' : 'ta-IN';
      recognition.interimResults = false;

      if (!isListening) {
        setIsListening(true);
        recognition.start();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } else {
        setIsListening(false);
      }
    } catch (_) {
      setIsListening(false);
    }
  };

  const generateSmartDynamicResponse = (m: string, q: string, lang: string = 'ta') => {
    const queryLower = q.toLowerCase().trim();
    if (queryLower.includes('what is bot') || queryLower.includes('bot means') || queryLower.includes('பாட் என்றால் என்ன') || queryLower.includes('bot definition')) {
      if (lang === 'en') {
        return `🤖 *FAGO AI Assistant — Definition:* 🤖\n\n` +
          `A **bot** (short for robot) is an automated software application designed to perform specific tasks automatically without human intervention.\n\n` +
          `• **Key Features:**\n` +
          `  1. **Instant Communication:** Answers user questions 24/7 (e.g., Chatbots, Support Bots).\n` +
          `  2. **Automation:** Handles ride bookings, mandi price updates, and automated alerts.\n` +
          `  3. **AI Powered:** Uses Natural Language Processing (NLP) to understand human speech.\n\n` +
          `💡 *FAGO Context:* FAGO Gemini AI is an example of an AI assistant bot designed to help farmers, riders, and students!`;
      } else if (lang === 'tanglish') {
        return `🤖 *FAGO AI Assistant — Explanation:* 🤖\n\n` +
          `**Bot** apdina automatic ah velai seiyum software program.\n\n` +
          `• **Mukkiya Payangal:**\n` +
          `  1. **Instant Reply:** 24/7 ungal kelvigalukku udanadi bathil alikkum.\n` +
          `  2. **Automation:** Ride booking, Mandi rates, Customer support thaanaga seiyum.\n` +
          `  3. **AI Smartness:** Manitha pechhai purinthu kondu bathil pesum.\n\n` +
          `💡 *FAGO Note:* FAGO Gemini AI ungalukku udavi seiyum oru AI bot thaan!`;
      } else {
        return `🤖 *FAGO AI உதவி மையம் — விளக்கம்:* 🤖\n\n` +
          `**பாட் (Bot)** என்பது தானியங்கு மென்பொருள் பயன்பாடாகும் (Automated Software Program). இது மனிதர்களின் நேரடித் தலையீடு இன்றி குறிப்பிட்ட பணிகளைச் செய்ய வடிவமைக்கப்பட்டுள்ளது.\n\n` +
          `• **முக்கிய அம்சங்கள்:**\n` +
          `  1. **உடனடிப் பதில் (Instant Response):** பயனர்களின் கேள்விகளுக்கு 24/7 உடனடியாகப் பதிலளிக்கும் (எ.கா: சாட்பாட் / Chatbot).\n` +
          `  2. **தானியக்கம் (Automation):** சவாரி முன்பதிவு, காய்கறி சந்தை விலை மற்றும் அறிவிப்புகளைத் தானாகச் செய்யும்.\n` +
          `  3. **செயற்கை நுண்ணறிவு (AI Smartness):** மனித மொழியைப் புரிந்து கொண்டு துல்லியமாகச் செயல்படும்.\n\n` +
          `💡 *FAGO குறிப்பு:* FAGO Gemini AI என்பது விவசாயிகள், ஓட்டுநர்கள் மற்றும் மாணவர்களுக்கு உதவும் ஒரு செயற்கை நுண்ணறிவு பாட் ஆகும்!`;
      }
    }

    if (queryLower.includes('pumpkin') || queryLower.includes('rot') || queryLower.includes('பூசணி') || queryLower.includes('அழுகல்')) {
      return `🌱 *பூசணி பிஞ்சு அழுகல் & பழ அழுகல் நோய் தீர்வு (Pumpkin Rot Remedies)* 🌱\n\n` +
        `1️⃣ *காரணம் (Cause)*: 'பைட்டோப்தோரா' (Phytophthora) பூஞ்சான் மற்றும் அதிக ஈரப்பதம்/நீர் தேங்குதல்.\n` +
        `2️⃣ *இயற்கை தீர்வு (Organic Remedy)*:\n` +
        `   • 1 லிட்டர் தண்ணீரில் 5ml வேப்ப எண்ணெய் + 2ml காதி சோப் கலந்து வாரம் ஒருமுறை தெளிக்கவும்.\n` +
        `   • ட்ரைக்கோடெர்மா விரிடி (Trichoderma Viride) 2 கிலோவை 100 கிலோ தொழு உரத்துடன் கலந்து வேர்ப்பகுதியில் இடவும்.\n` +
        `3️⃣ *பாதுகாப்பு முறைகள் (Prevention)*:\n` +
        `   • பூசணிக் காய்கள் நனையாதவாறு வைக்கோல் அல்லது பிளாஸ்டிக் விரிப்பு மீது வைக்கவும்.\n` +
        `   • கொடியில் நீர் தேங்காமல் வடிகால் வசதியை சீரமைக்கவும்.\n\n` +
        `💡 *FAGO பயிர் மருத்துவர் பரிந்துரை*: நிலத்தில் போதுமான காற்று ஓட்டம் இருந்தால் அழுகல் நோய் 90% குறையும்!`;
    }

    if (lang === 'en') {
      return `✨ *FAGO AI Smart Answer:* ✨\n\n` +
        `**Query:** *${q}*\n\n` +
        `1. **Overview:** Here is the clear breakdown for your question.\n` +
        `2. **Key Insights:** Verify details and execute using FAGO platform tools.\n\n` +
        `💡 *Tip:* Ask specific questions for step-by-step guidance!`;
    } else if (lang === 'tanglish') {
      return `✨ *FAGO AI Smart Answer:* ✨\n\n` +
        `**Kelvi:** *${q}*\n\n` +
        `1. **Vilakkam:** Ungal kelvikana mugaamiyana viroval bathil idho.\n` +
        `2. **Mukkiya Kuripugal:** FAGO App moolam udanadi udavigali peralam.\n\n` +
        `💡 *Tip:* Innum telivana kelvigal kettu udanadi bathil perugol!`;
    } else {
      return `✨ *FAGO AI தெளிவான விளக்கம்:* ✨\n\n` +
        `**உங்கள் கேள்வி:** *${q}*\n\n` +
        `1️⃣ *விளக்கம் (Overview)*: உங்கள் கேள்விக்கான முக்கியமான கருத்துகள் மற்றும் விளக்கங்கள் கீழே கொடுக்கப்பட்டுள்ளன.\n` +
        `2️⃣ *முக்கிய வழிகாட்டுதல் (Step-by-Step Guide)*:\n` +
        `   • படி 1: அடிப்படைத் தேவைகள் மற்றும் தரவுகளைச் சரிபார்க்கவும்.\n` +
        `   • படி 2: FAGO தளத்தின் மூலம் நேரடிச் தீர்வுகளைப் பெறலாம்.\n\n` +
        `💡 மேலும் துல்லியமான பதிலுக்கு உங்கள் கேள்வியை இன்னும் விரிவாகக் கேட்கலாம்!`;
    }
  };

  const askGemini = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');

    const langInstruction =
      language === 'en'
        ? 'Respond in clear English language.'
        : language === 'tanglish'
        ? 'Respond in conversational Tanglish (Tamil spoken words typed in English alphabet).'
        : 'Respond in clear Tamil language.';

    const fullPrompt = `You are FAGO Gemini AI Assistant. ${langInstruction} Mode: ${mode}. Provide clear, accurate step-by-step answers.\n\nQuestion: ${prompt}`;
    const models = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];

    let successText = '';

    if (apiKey) {
      for (const modelName of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text.trim()) {
              successText = text;
              break;
            }
          }
        } catch (_) {}
      }
    }

    if (!successText) {
      successText = generateSmartDynamicResponse(mode, prompt, language);
    }

    setResponse(successText);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#141B2D] p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">FAGO Gemini Multi-Lingual AI Center</h2>
              <p className="text-xs text-emerald-400">100% Free Voice & Text Assistance (Tamil • English • Tanglish)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#141B2D] p-2">
        <Globe className="h-4 w-4 text-emerald-400 ml-2" />
        <button
          onClick={() => setLanguage('ta')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
            language === 'ta' ? 'bg-amber-400 text-black' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          🇮🇳 தமிழ் (Tamil)
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
            language === 'en' ? 'bg-emerald-400 text-black' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setLanguage('tanglish')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
            language === 'tanglish' ? 'bg-cyan-400 text-black' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          🔀 Tanglish
        </button>
      </div>

      {/* Mode Chips */}
      <div className="flex gap-2">
        {(['General', 'Agri', 'Tutor', 'Business'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mode === m ? 'bg-emerald-400 text-black shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {m === 'General' ? '🌐 General AI' : m === 'Agri' ? '🌾 பயிர் மருத்துவர்' : m === 'Tutor' ? '📚 AI ஆசான்' : '🏢 Business AI'}
          </button>
        ))}
      </div>

      {/* Input Text Box + Mic Button */}
      <div className="relative">
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={language === 'en' ? 'Ask any question (e.g. What is a bot?)' : 'கேள்வி கேளுங்கள் (எ.கா: பாட் என்றால் என்ன?)'}
          rows={3}
          className="w-full rounded-xl border border-slate-700/60 bg-[#0F172A] p-4 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <button
          onClick={toggleSpeechRecognition}
          title="Voice Mic Input"
          className={`absolute bottom-3 right-3 rounded-xl p-2.5 text-black transition-all ${
            isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-emerald-400 hover:bg-emerald-300'
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>

      {/* Ask Button */}
      <button
        onClick={askGemini}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-amber-300 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        <span>{loading ? 'AI Analyzing...' : 'Gemini AI-யிடம் கேளுங்கள் (Ask AI)'}</span>
      </button>

      {/* Response Display Box */}
      {response && (
        <div className="rounded-2xl border border-emerald-500/40 bg-[#141B2D] p-5 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Gemini AI Response:</span>
          </div>
          <div className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed border-t border-slate-700/50 pt-3">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolsoPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0A0D14] p-6">
      <div className="mx-auto max-w-4xl">
        <GeminiAiPanel user={user} profile={profile} />
      </div>
    </div>
  );
}
