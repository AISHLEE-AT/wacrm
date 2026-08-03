"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Lock, ShieldCheck, Loader2, ArrowRight, Sparkles, UserCheck } from "lucide-react";

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
  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("Traveller");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnName, setReturnName] = useState("");

  const supabase = createClient();

  // Check if session exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/rideo');
    });
  }, []);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setError(null);
    setIsReturning(false);
    setReturnName("");

    if (clean === '9486335870') {
      setIsReturning(true);
      setReturnName("Admin User (FAGO & WACRM SuperAdmin)");
      setFullName("Admin User (FAGO & WACRM SuperAdmin)");
      setCategory("Admin");
    } else if (clean === '9123596988') {
      setIsReturning(true);
      setReturnName("FAGO Driver (Test Driver)");
      setFullName("FAGO Driver (Test Driver)");
      setCategory("Driver");
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (pin.length !== 4) {
      setError("Please enter your 4-digit Secure PIN");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, fullName, category })
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
                <img src="/brand-leaf-logo.png?v=4" alt="WACRM Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-white tracking-tight">UNIFIED WACRM</h1>
                <p className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Unified CRM Platform
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Supabase Custom PIN Auth • Fast & Secure</p>
          </div>

          <form onSubmit={handlePinLogin} className="px-8 py-7 space-y-5">
            {/* Phone Input */}
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
                  className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-28 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-base placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Welcome banner for test users */}
            {isReturning && returnName && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 font-semibold text-xs">{returnName}</p>
                  <p className="text-gray-400 text-[11px]">Enter PIN (Default: 1234) to sign in</p>
                </div>
              </div>
            )}

            {/* 4-Digit PIN Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                4-Digit Secure PIN
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                  required
                />
              </div>
            </div>

            {/* Name + Category for New Registration */}
            {!isReturning && phone.length === 10 && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
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
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || phone.length !== 10 || pin.length !== 4}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-base"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              Sign In with PIN
            </button>

            <div className="pt-4 border-t border-emerald-500/10 text-center">
              <p className="text-gray-500 text-xs">Protected by Supabase Custom PIN Encryption</p>
              <p className="text-gray-600 text-xs mt-1">வாழ்க • வளர்க • வெல்க 🌿</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
