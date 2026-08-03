"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Lock, ShieldCheck, Loader2, Sparkles, MessageCircle, KeyRound, UserCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

const CATEGORIES = [
  { key: 'Admin',      label: '👑 Admin (CRM & All Modules)', route: '/crm' },
  { key: 'Traveller',  label: '🧳 Traveller (RideO)',     route: '/rideo' },
  { key: 'Farmer',    label: '🚜 Farmer (RentO Agri)',   route: '/rento' },
  { key: 'Shopper',   label: '🛍️ Shopper (DealO)',       route: '/dealo' },
  { key: 'Driver',    label: '🚖 Driver (DriveO)',        route: '/drivo' },
  { key: 'Student',   label: '🎓 Student (TeachO)',       route: '/teacho' },
  { key: 'Teacher',   label: '👨‍🏫 Teacher (TeachO)',      route: '/teacho' },
  { key: 'Financier', label: '💰 Financier (MoneyO)',    route: '/moneyo' },
  { key: 'Tourist',   label: '🛕 Tourist (TourO)',        route: '/touro' },
];

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("Traveller");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // 'phone' = enter number, 'otp' = enter otp, 'pin' = fallback pin
  const [step, setStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [wabaPhone, setWabaPhone] = useState("919486335870");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/rideo');
    });

    fetch('/api/auth/otp/waba')
      .then(res => res.json())
      .then(data => {
        if (data.phone) setWabaPhone(data.phone);
      })
      .catch(console.error);
  }, [router, supabase]);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setError(null);
    setIsExistingUser(null);

    if (clean.length === 10) {
      setIsChecking(true);
      fetch(`/api/auth/check?phone=${clean}`)
        .then(res => res.json())
        .then(data => {
          setIsExistingUser(data.exists);
          if (data.exists) {
            if (data.name) setFullName(data.name);
            if (data.category) setCategory(data.category);
          }
        })
        .catch(() => setIsExistingUser(false))
        .finally(() => setIsChecking(false));
    }
  };

  const requestOtp = () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError(null);
    setStep('otp');
    window.open(`https://wa.me/${wabaPhone}?text=Requesting OTP for Login`, '_blank');
  };

  const handleAuth = async (e: React.FormEvent, endpoint: '/api/auth/otp/verify' | '/api/auth/pin') => {
    e.preventDefault();
    setError(null);

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (endpoint === '/api/auth/otp/verify' && otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (endpoint === '/api/auth/pin' && pin.length !== 4) {
      setError("Please enter your 4-digit PIN");
      return;
    }

    setLoading(true);
    try {
      let payload: any = {};
      if (endpoint === '/api/auth/pin') {
        // PIN login mode
        payload = { phone, pin };
      } else {
        // OTP verify mode
        payload = { phone, otp };
        if (!isExistingUser) {
          payload.fullName = fullName;
          payload.category = category;
          if (pin) payload.pin = pin; // Setup PIN for new users
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      const target = inviteToken ? `/join/${encodeURIComponent(inviteToken)}` : (data.redirect_to || '/rideo');
      window.location.href = target;
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#0d1526]/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden">
          {/* Header Branding */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/10 border-b border-emerald-500/20 px-8 py-7 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden border border-emerald-500/20">
                <img src="/supro-logo-ai.jpg" alt="SuprO Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left flex items-center">
                <img src="/supro-text-logo.jpg" alt="SuprO for Local Needs" className="h-14 object-contain mix-blend-lighten" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Secure Authentication via WhatsApp</p>
          </div>

          <div className="px-8 py-7 space-y-5">
            {/* Phone Input (Always visible) */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">+91</span>
                  <div className="w-px h-4 bg-emerald-500/30" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  disabled={step !== 'phone'}
                  className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-28 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-base placeholder:text-gray-600 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Name + Category for New Registration (Shown only in initial step) */}
            {step === 'phone' && phone.length === 10 && isExistingUser === false && !isChecking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1 overflow-hidden">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name (If new user)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Goal / Role</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Setup 4-Digit PIN (Emergency Login)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="****"
                      className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 tracking-[0.5em] text-lg font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Used if WhatsApp OTP is unavailable. Must be exactly 4 digits.</p>
                </div>
              </motion.div>
            )}

            {/* Recognized User Display (Shown for existing users) */}
            {step === 'phone' && phone.length === 10 && isExistingUser === true && !isChecking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1 overflow-hidden">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Welcome Back</p>
                    <p className="text-white font-medium">{fullName}</p>
                    <p className="text-gray-400 text-xs">{CATEGORIES.find(c => c.key === category)?.label || category}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading Indicator for User Check */}
            {step === 'phone' && phone.length === 10 && isChecking && (
              <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking profile...
              </div>
            )}

            {/* Step: Phone -> Request OTP button */}
            {step === 'phone' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={phone.length !== 10 || isChecking}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-base"
                >
                  {isChecking ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                  Send OTP via WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setStep('pin')}
                  disabled={phone.length !== 10}
                  className="w-full bg-[#111c35] hover:bg-[#1a294d] border border-emerald-500/30 text-emerald-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  <KeyRound className="h-4 w-4" />
                  Use Fallback PIN Instead
                </button>
              </div>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={e => handleAuth(e, '/api/auth/otp/verify')} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    6-Digit WhatsApp OTP
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4">
                      <Lock className="h-4 w-4 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    We just opened WhatsApp for you. Hit send and we will immediately reply with your OTP.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-base"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Verify OTP & Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Go back
                </button>
              </motion.form>
            )}

            {/* Step: PIN */}
            {step === 'pin' && (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={e => handleAuth(e, '/api/auth/pin')} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    4-Digit Secure PIN
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4">
                      <Lock className="h-4 w-4 text-amber-400" />
                    </div>
                    <input
                      type="password"
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full bg-[#111c35] border border-amber-500/30 rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 text-base"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Sign In with PIN
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Go back
                </button>
              </motion.form>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
            )}

            <div className="pt-4 border-t border-emerald-500/10 text-center">
              <p className="text-gray-500 text-xs">Authentication verified by SuprO Engine</p>
              <p className="text-gray-600 text-xs mt-1">வாழ்க • வளர்க • வெல்க 🌿</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
