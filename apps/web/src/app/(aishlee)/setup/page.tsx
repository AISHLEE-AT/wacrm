'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { 
  User, 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  GraduationCap, 
  Briefcase, 
  Car, 
  Building2, 
  Tractor, 
  Users,
  ClipboardCheck, 
  Plane, 
  Landmark, 
  CheckSquare, 
  Store, 
  PlaySquare, 
  Truck,
  Loader2
} from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className={`px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 ${
        type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          <Check className="w-4 h-4" />
        </div>
        <span className="font-medium">{message}</span>
      </div>
    </div>,
    document.body
  );
};

const CATEGORIES = [
  { id: 'Student', icon: GraduationCap, label: 'Student', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
  { id: 'Professional', icon: Briefcase, label: 'Professional', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/30' },
  { id: 'Driver', icon: Car, label: 'Driver', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/30' },
  { id: 'Business Owner', icon: Building2, label: 'Business Owner', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30' },
  { id: 'Farmer', icon: Tractor, label: 'Farmer', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' },
  { id: 'Other', icon: Users, label: 'Other', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500/30' },
];

const MODULES = [
  { id: '/teach', name: 'TeachO', icon: GraduationCap, color: '#3B82F6' },
  { id: '/test', name: 'TestO', icon: ClipboardCheck, color: '#EF4444' },
  { id: '/tour', name: 'TourO', icon: Plane, color: '#10B981' },
  { id: '/money', name: 'MoneyO', icon: Landmark, color: '#F59E0B' },
  { id: '/task', name: 'TaskO', icon: CheckSquare, color: '#8B5CF6' },
  { id: '/trade', name: 'TradeO', icon: Store, color: '#EC4899' },
  { id: '/tv', name: 'TvO', icon: PlaySquare, color: '#14B8A6' },
  { id: '/rid', name: 'RidO', icon: Car, color: '#F43F5E' },
  { id: '/driv', name: 'DrivO', icon: Truck, color: '#EAB308' },
];

export default function SetupWizard() {
  const router = useRouter();
  const { currentUser, updateProfile } = useApp();
  
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (currentUser?.fullName) {
      setFullName(currentUser.fullName);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || whatsapp.replace(/\D/g, '').length !== 10) {
        setToast({ message: 'Please enter valid name and 10-digit WhatsApp number.', type: 'error' });
        return;
      }
    }
    if (step === 2 && !mainCategory) {
      setToast({ message: 'Please select a category.', type: 'error' });
      return;
    }
    setStep(s => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async (module: string | null) => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        whatsapp,
        main_category: mainCategory,
        default_module: module || '/',
        profile_complete: true
      });
      setToast({ message: 'Profile completed successfully!', type: 'success' });
      setTimeout(() => {
        router.push(module || '/');
      }, 1000);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update profile.', type: 'error' });
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="animate-fade-in-up space-y-6 w-full max-w-md mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome to FAGO/ENOW</h2>
        <p className="text-gray-400">Let's set up your profile to personalize your experience.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[rgba(255,255,255,0.08)] transition-all"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">WhatsApp Number</label>
          <div className="relative group flex">
            <div className="flex-shrink-0 flex items-center justify-center px-4 bg-[rgba(255,255,255,0.02)] border border-r-0 border-white/10 rounded-l-xl text-gray-400">
              <span className="text-sm font-medium mr-2">+91</span>
              <Phone className="h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setWhatsapp(val);
              }}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-r-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[rgba(255,255,255,0.08)] transition-all"
              placeholder="10-digit number"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in-up space-y-6 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Who are you?</h2>
        <p className="text-gray-400">Choose the category that best describes you.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = mainCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setMainCategory(cat.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${
                isSelected 
                  ? `${cat.border} bg-[rgba(255,255,255,0.08)] shadow-[0_0_20px_rgba(255,255,255,0.05)]` 
                  : 'border-white/5 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:border-white/10'
              }`}
            >
              <div className={`p-4 rounded-xl ${cat.bg} transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}>
                <Icon className={`w-8 h-8 ${cat.color}`} />
              </div>
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in-up space-y-6 w-full max-w-3xl mx-auto pb-20">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Choose Default Module</h2>
        <p className="text-gray-400">Select the module you want to see first when you log in.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => handleSubmit(mod.id)}
              disabled={loading}
              className="p-6 rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:border-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: mod.color }}
              />
              <div 
                className="p-4 rounded-2xl transition-transform duration-300 group-hover:-translate-y-1"
                style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
              >
                <Icon className="w-8 h-8" />
              </div>
              <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{mod.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={() => handleSubmit(null)}
          disabled={loading}
          className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
        >
          Skip &mdash; use Home screen
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto mb-12 flex justify-between items-center relative z-10">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-500 ease-out -z-10"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {[1, 2, 3].map((num) => (
          <div 
            key={num}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
              step >= num 
                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'bg-[#1A1A24] border border-white/10 text-gray-500'
            }`}
          >
            {step > num ? <Check className="w-4 h-4" /> : num}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Navigation Buttons (only for step 1 & 2) */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-20">
          <div className="max-w-md mx-auto flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] text-white font-medium hover:bg-[rgba(255,255,255,0.08)] transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
