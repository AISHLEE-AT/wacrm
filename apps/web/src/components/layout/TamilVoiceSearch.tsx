// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TamilVoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('உங்கள் பிரவுசரில் குரல் தேடல் வசதி இல்லை. Google Chrome-ல் முயற்சிக்கவும்.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ta-IN'; // Tamil (India)
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setIsOpen(true);
    setTranscript('பேசுங்கள்... (எ.கா: "டாக்சி வேணும்", "தேர்வு", "பயிர் மருத்துவம்")');

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processVoiceCommand(text.toLowerCase());
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('குரலை உணர முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (text: string) => {
    if (text.includes('டாக்சி') || text.includes('பயணம்') || text.includes('ride') || text.includes('taxi')) {
      setTimeout(() => { setIsOpen(false); router.push('/rideo'); }, 1200);
    } else if (text.includes('வாடகை') || text.includes('டிராக்டர்') || text.includes('rent')) {
      setTimeout(() => { setIsOpen(false); router.push('/rento'); }, 1200);
    } else if (text.includes('தேர்வு') || text.includes('பரீட்சை') || text.includes('test')) {
      setTimeout(() => { setIsOpen(false); router.push('/testo'); }, 1200);
    } else if (text.includes('பாடம்') || text.includes('பயிற்சி') || text.includes('teach')) {
      setTimeout(() => { setIsOpen(false); router.push('/teacho'); }, 1200);
    } else if (text.includes('டிவி') || text.includes('பாட்டு') || text.includes('tv')) {
      setTimeout(() => { setIsOpen(false); router.push('/tvo'); }, 1200);
    } else if (text.includes('பயிர்') || text.includes('விவசாயம்') || text.includes('மருந்து')) {
      setTimeout(() => { setIsOpen(false); router.push('/ai-assistant'); }, 1200);
    } else if (text.includes('பணம்') || text.includes('wallet') || text.includes('money')) {
      setTimeout(() => { setIsOpen(false); router.push('/moneyo'); }, 1200);
    }
  };

  return (
    <>
      <button
        onClick={startVoiceSearch}
        className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 transition shadow-sm"
        title="தமிழ் குரல் தேடல் (Tamil Voice AI Search)"
      >
        <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse text-red-400' : 'text-emerald-400'}`} />
        <span className="hidden sm:inline">தமிழ் குரல் தேடல்</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              isListening ? 'bg-red-500/20 border-2 border-red-500 animate-ping' : 'bg-emerald-500/20 border-2 border-emerald-500'
            }`}>
              <Mic className={`w-8 h-8 ${isListening ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> தமிழ் AI குரல் தேடல்
              </h3>
              <p className="text-xs text-slate-400 mt-1">பேசுங்கள்... எ.கா: "டாக்சி வேணும்", "தேர்வு", "பயிர் நோய்"</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl text-sm font-semibold text-emerald-300 min-h-[60px] flex items-center justify-center">
              "{transcript}"
            </div>
          </div>
        </div>
      )}
    </>
  );
}
