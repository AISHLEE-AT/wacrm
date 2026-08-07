'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Languages, FileText, MessageSquare, Copy, Check, KeyRound } from 'lucide-react';

export default function ToolsoPage() {
  const [promptInput, setPromptInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setUserApiKey(saved);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserApiKey(val);
    if (val) {
      localStorage.setItem('gemini_api_key', val);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const callAI = async (prompt: string, type: string) => {
    if (!prompt) return;
    setIsLoading(true);
    setAiResult('Thinking...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, apiKey: userApiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data.result);
      } else {
        setAiResult(`[Error]\n${data.error || 'Failed to generate response.'}`);
      }
    } catch (err: any) {
      setAiResult(`[Error]\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (type: string) => {
    let prompt = '';
    if (type === 'translate') {
      prompt = window.prompt("Enter text to translate (Tamil/English):") || '';
    } else if (type === 'whatsapp') {
      prompt = window.prompt("Describe the customer inquiry or scenario for the auto-reply:") || '';
    } else if (type === 'summarize') {
      prompt = window.prompt("Paste the text you want to summarize:") || '';
    }
    if (prompt) {
      callAI(prompt, type);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">🤖</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              ToolsO <span className="text-xs bg-amber-500/20 text-amber-300 font-normal px-2.5 py-0.5 rounded-full border border-amber-500/30">Gemini AI & கருவிகள்</span>
            </h1>
            <p className="text-sm text-slate-400">AI Assistants, Tamil Translator, WhatsApp Templates & Smart Productivity Tools</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl p-2">
          <KeyRound className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="password"
            placeholder="Your Gemini API Key (Optional)"
            value={userApiKey}
            onChange={handleApiKeyChange}
            className="bg-transparent border-none focus:outline-none text-xs text-slate-200 w-full sm:w-48 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick AI Tool Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select AI Utility</h3>

          <div
            onClick={() => handleGenerate('translate')}
            className={`cursor-pointer bg-slate-900/90 border ${isLoading ? 'border-amber-500/40 opacity-50' : 'border-slate-800 hover:border-amber-500/40'} transition-all rounded-2xl p-4 flex items-center gap-3`}
          >
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Tamil & English AI Translator</h4>
              <p className="text-xs text-slate-400">Instant accurate regional translations</p>
            </div>
          </div>

          <div
            onClick={() => handleGenerate('whatsapp')}
            className={`cursor-pointer bg-slate-900/90 border ${isLoading ? 'border-amber-500/40 opacity-50' : 'border-slate-800 hover:border-amber-500/40'} transition-all rounded-2xl p-4 flex items-center gap-3`}
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">WhatsApp Auto-Reply Generator</h4>
              <p className="text-xs text-slate-400">Create professional customer responses</p>
            </div>
          </div>

          <div
            onClick={() => handleGenerate('summarize')}
            className={`cursor-pointer bg-slate-900/90 border ${isLoading ? 'border-amber-500/40 opacity-50' : 'border-slate-800 hover:border-amber-500/40'} transition-all rounded-2xl p-4 flex items-center gap-3`}
          >
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">AI Document Summarizer</h4>
              <p className="text-xs text-slate-400">Extract key bullet points from text</p>
            </div>
          </div>
        </div>

        {/* AI Output Workspace */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-pulse' : ''}`} /> AI Result Output
              </h3>
              {aiResult && !isLoading && (
                <button
                  onClick={handleCopy}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              )}
            </div>

            <div className="min-h-[220px] bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap">
              {aiResult ? aiResult : <span className="text-slate-600">Select an AI tool from the left panel to generate response...</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI anything or paste text to convert..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && promptInput && callAI(promptInput, 'chat')}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
              disabled={isLoading || !promptInput}
              onClick={() => callAI(promptInput, 'chat')}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              {isLoading ? 'Thinking...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
