'use client';

import React, { useState, useRef } from 'react';
import { Mic, Image as ImageIcon, Send, Share2, Loader2, Play } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function NativeAIAssistant() {
  const [activeTab, setActiveTab] = useState<'kural' | 'status'>('kural');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  // StatusO state
  const [statusPrompt, setStatusPrompt] = useState('');
  const statusRef = useRef<HTMLDivElement>(null);

  // Kural AI State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Helpers for StatusO
  const generateStatus = async () => {
    if (!statusPrompt) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: statusPrompt, type: 'status_quote' })
      });
      const data = await res.json();
      if (data.result) {
        setResponse(data.result);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate status');
    } finally {
      setLoading(false);
    }
  };

  const downloadStatus = async () => {
    if (statusRef.current) {
      try {
        const canvas = await html2canvas(statusRef.current, { scale: 2, backgroundColor: '#020617' });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = 'SuprO_Status.jpg';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to capture image", err);
      }
    }
  };

  // Helpers for Kural AI (Voice)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result?.toString().split(',')[1];
          if (base64Data) {
            setLoading(true);
            setResponse('');
            try {
              const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: '', base64Audio: base64Data })
              });
              const data = await res.json();
              if (data.result) setResponse(data.result);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to get audio permissions", err);
      alert("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <span className="text-2xl p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">🤖</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Native AI Hub <span className="text-xs bg-indigo-500/20 text-indigo-300 font-normal px-2 py-0.5 rounded-full border border-indigo-500/30">SuprO Web</span>
          </h1>
          <p className="text-sm text-slate-400">Voice-powered Kural AI and StatusO generation.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => { setActiveTab('kural'); setResponse(''); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'kural' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Mic size={18} /> Kural AI (Voice)
        </button>
        <button
          onClick={() => { setActiveTab('status'); setResponse(''); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'status' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ImageIcon size={18} /> StatusO (WhatsApp)
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-6">
        
        {/* Kural AI Tab */}
        {activeTab === 'kural' && (
          <div className="flex flex-col items-center justify-center space-y-6 pt-10">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">Ask anything in Tamil or English</h2>
              <p className="text-slate-400">Click and speak to use voice commands natively in the web app.</p>
            </div>
            
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)]' 
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <Mic size={48} className="text-white" />
            </button>
            <p className="text-sm text-slate-500 font-medium">
              {isRecording ? 'Recording... Release to send' : 'Hold to speak'}
            </p>

            {loading && <Loader2 className="animate-spin text-indigo-400" size={32} />}
            
            {response && (
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-8">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
            )}
          </div>
        )}

        {/* StatusO Tab */}
        {activeTab === 'status' && (
          <div className="flex flex-col max-w-2xl mx-auto space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Topic or Keyword for Status Quote:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={statusPrompt}
                  onChange={(e) => setStatusPrompt(e.target.value)}
                  placeholder="e.g. Hard work, Morning motivation, Farmer pride..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={generateStatus}
                  disabled={loading || !statusPrompt}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 rounded-xl text-white font-medium flex items-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Generate
                </button>
              </div>
            </div>

            {response && (
              <div className="space-y-4">
                {/* The Render Canvas */}
                <div 
                  ref={statusRef}
                  className="relative w-full aspect-square bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-12 text-center rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800"
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                  
                  <p className="text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg z-10 font-serif">
                    "{response}"
                  </p>
                  
                  <div className="absolute bottom-6 flex items-center gap-2 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-[10px]">S</span>
                    </div>
                    <span className="text-sm font-medium text-white tracking-widest uppercase">SuprO App</span>
                  </div>
                </div>

                <button
                  onClick={downloadStatus}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <Share2 size={20} />
                  Download for WhatsApp Status
                </button>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
