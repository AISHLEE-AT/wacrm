'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, GraduationCap, ClipboardCheck, Plane, Landmark, CheckSquare, Store, PlaySquare, Wrench, Car, Briefcase, User, BriefcaseBusiness, BusFront, Sprout, MoreHorizontal } from 'lucide-react';

const MODULES = [
  { id: 'teacho', label: 'TeachO', icon: GraduationCap, color: '#3B82F6', desc: 'Online Academy & Courses' },
  { id: 'testo', label: 'TestO', icon: ClipboardCheck, color: '#EF4444', desc: 'Assessments & Exams' },
  { id: 'touro', label: 'TourO', icon: Plane, color: '#10B981', desc: 'Travel & Tours' },
  { id: 'moneyo', label: 'MoneyO', icon: Landmark, color: '#F59E0B', desc: 'Finance & Wallet' },
  { id: 'tasko', label: 'TaskO', icon: CheckSquare, color: '#8B5CF6', desc: 'Task Management' },
  { id: 'tradeo', label: 'TradeO', icon: Store, color: '#EC4899', desc: 'Business & Trade' },
  { id: 'tvo', label: 'TvO', icon: PlaySquare, color: '#14B8A6', desc: 'Entertainment & Media' },
  { id: 'toolso', label: 'ToolsO', icon: Wrench, color: '#F43F5E', desc: 'AI Generators & Tools' },
  { id: 'rido', label: 'RidO', icon: Car, color: '#8B5CF6', desc: 'Book a Ride' },
  { id: 'rideo', label: 'RideO', icon: BusFront, color: '#6366F1', desc: 'Driver Dashboard' },
  { id: 'drivo', label: 'DrivO', icon: Briefcase, color: '#EAB308', desc: 'Logistics & Delivery' },
];

const CATEGORIES = [
  { title: 'Student', icon: GraduationCap, color: '#3B82F6' },
  { title: 'Professional', icon: BriefcaseBusiness, color: '#10B981' },
  { title: 'Driver', icon: Car, color: '#6366F1' },
  { title: 'Business Owner', icon: Store, color: '#F59E0B' },
  { title: 'Farmer', icon: Sprout, color: '#14B8A6' },
  { title: 'Other', icon: MoreHorizontal, color: '#8B5CF6' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Authenticated users bypass onboarding and land directly on RideO
        router.replace('/rideo');
      }
    }
    loadProfile();
  }, [supabase.auth, router]);

  const handleSubmit = async (skipped = false) => {
    if (!skipped && !selectedModule) {
      setError('Please select a module or click Skip.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = {
        profile_complete: true,
      };

      if (fullName) updates.full_name = fullName;
      if (whatsapp) updates.whatsapp = `+91${whatsapp}`;
      if (selectedCategory) updates.main_category = selectedCategory;
      if (!skipped && selectedModule) updates.default_module = selectedModule;

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Set cookie so middleware knows we finished
      document.cookie = "fago_onboarded=1; path=/; max-age=31536000";

      // Redirect to selected module or dashboard
      if (!skipped && selectedModule) {
        router.push(`/${selectedModule.toLowerCase()}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving your profile.');
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="flex flex-col text-left w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-white mb-2">Let's get to know you</h1>
      <p className="text-neutral-400 mb-8">Enter your details below.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-400">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-400">WhatsApp Number</label>
          <div className="relative mt-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">+91</span>
            <input
              type="tel"
              maxLength={10}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="9876543210"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <button
        onClick={() => {
          const isValidPhone = whatsapp.length === 10 && /^[6-9]\d{9}$/.test(whatsapp);
          if (fullName && isValidPhone) {
            setError('');
            setCurrentStep(1);
          } else {
            setError('Please enter a valid name and a 10-digit Indian WhatsApp number.');
          }
        }}
        className="w-full mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col text-left w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[70vh]">
      <h1 className="text-3xl font-bold text-white mb-2">What do you do?</h1>
      <p className="text-neutral-400 mb-8">Select your main category.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2 pb-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.title;
          const Icon = cat.icon;
          return (
            <button
              key={cat.title}
              onClick={() => setSelectedCategory(cat.title)}
              style={{
                backgroundColor: isSelected ? `${cat.color}33` : 'rgba(255,255,255,0.05)',
                borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.1)',
              }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all hover:bg-white/10"
            >
              <Icon size={32} color={isSelected ? cat.color : 'rgba(255,255,255,0.5)'} className="mb-3" />
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <button
        onClick={() => {
          if (selectedCategory) {
            setError('');
            setCurrentStep(2);
          } else {
            setError('Please select a category');
          }
        }}
        className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Next
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col text-left w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[80vh]">
      <h1 className="text-3xl font-bold text-white mb-2">Choose Default Home</h1>
      <p className="text-neutral-400 mb-8">You can change this later in settings.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-2 pb-4">
        {MODULES.map((mod) => {
          const isSelected = selectedModule === mod.id;
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod.id)}
              style={{
                backgroundColor: isSelected ? `${mod.color}33` : 'rgba(255,255,255,0.05)',
                borderColor: isSelected ? mod.color : 'rgba(255,255,255,0.1)',
              }}
              className="flex flex-col items-start justify-between p-5 rounded-2xl border transition-all hover:bg-white/10 text-left h-36"
            >
              <Icon size={28} color={mod.color} />
              <div>
                <div className="font-bold text-white text-lg">{mod.label}</div>
                <div className="text-xs text-white/60 mt-1">{mod.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-medium py-3 rounded-xl transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
          className="flex-[2] bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-100px] left-[-50px] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-3xl mb-8 flex items-center relative z-10">
        {currentStep > 0 && (
          <button 
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors absolute left-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        )}
        <div className="flex-1 px-12">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
      </div>
    </div>
  );
}
