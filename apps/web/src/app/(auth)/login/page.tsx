"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Lock, ShieldCheck, Loader2, Sparkles, MessageCircle, KeyRound, UserCheck, Eye, EyeOff } from "lucide-react";

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
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("Traveller");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [pendingSession, setPendingSession] = useState<any>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string>('/rideo');

  // Steps: 'phone' → 'otp' → 'set-pin' (if no PIN set) → done
  //        'phone' → 'pin' (fallback)
  const [step, setStep] = useState<'phone' | 'otp' | 'set-pin' | 'pin'>('phone');
  const [wabaPhone, setWabaPhone] = useState("916381029380");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/rideo');
    });

    fetch('/api/auth/otp/waba')
      .then(res => res.json())
      .then(data => { if (data.phone) setWabaPhone(data.phone); })
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
            if (data.has_pin) {
              setStep('pin');
            }
          }
        })
        .catch(() => setIsExistingUser(false))
        .finally(() => setIsChecking(false));
    }
  };

  const requestOtp = () => {
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    setError(null);
    setStep('otp');
    window.open(`https://wa.me/${wabaPhone}?text=Requesting OTP for Login`, '_blank');
  };

  // Called after OTP verified — saves session and decides next step
  const afterOtpSuccess = async (data: any) => {
    // Store session in Supabase client
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    const target = inviteToken
      ? `/join/${encodeURIComponent(inviteToken)}`
      : (data.redirect_to || '/rideo');

    if (data.needs_pin_setup) {
      // User has no PIN yet — force PIN setup before entering app
      setPendingSession(data.session);
      setPendingRedirect(target);
      setStep('set-pin');
    } else {
      window.location.href = target;
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }

    setLoading(true);
    try {
      const payload: any = { phone, otp };
      if (!isExistingUser) {
        payload.fullName = fullName;
        payload.category = category;
      }

      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      await afterOtpSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPin.length !== 4) { setError("PIN must be exactly 4 digits"); return; }
    if (newPin !== confirmPin) { setError("PINs do not match. Please re-enter."); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/pin/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin: newPin, confirmPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save PIN');
      // PIN saved — go to app
      window.location.href = pendingRedirect;
    } catch (err: any) {
      setError(err.message || 'Failed to save PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    if (pin.length !== 4) { setError("Please enter your 4-digit PIN"); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
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
      {/* Background Effects */}
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
          {/* Header */}
          <div className="bg-gradient-to-b from-emerald-900/30 via-[#0d1526] to-[#0d1526] border-b border-emerald-500/20 px-8 py-8 text-center relative overflow-hidden">
            {/* Background glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Deepam Logo with golden glow ring */}
            <div className="flex flex-col items-center gap-3 mb-4 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl scale-110" />
                <div className="relative w-20 h-20 rounded-2xl bg-[#0a0f1e] flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.4),0_0_60px_rgba(52,211,153,0.15)] border-2 border-emerald-500/40 overflow-hidden">
                  <img src="/supro-logo-ai.jpg" alt="SuprO Deepam Logo" className="w-full h-full object-cover" />
                </div>
                {/* Golden shimmer dot */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(251,191,36,0.8)] flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-amber-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)] leading-tight">
                  SuprO
                </h1>
                <p className="text-amber-400/90 text-[10px] font-bold tracking-[0.3em] uppercase mt-0.5">
                  ✦ for Local Needs ✦
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm relative z-10">
              {step === 'set-pin' ? '🔐 Set Your 4-Digit Secret PIN' : '🔒 Secure Authentication via WhatsApp'}
            </p>
          </div>

          <div className="px-8 py-7 space-y-5">
            <AnimatePresence mode="wait">

              {/* ── Step: PHONE ── */}
              {step === 'phone' && (
                <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
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

                  {/* New user: name + category */}
                  {phone.length === 10 && isExistingUser === false && !isChecking && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1 overflow-hidden">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Create New Account</p>
                          <p className="text-white text-sm mt-0.5">Looks like you're new! Let's set up your profile.</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your Full Name"
                          className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Role</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                          className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-emerald-500 text-sm">
                          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* Existing user welcome */}
                  {phone.length === 10 && isExistingUser === true && !isChecking && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
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

                  {phone.length === 10 && isChecking && (
                    <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking profile...
                    </div>
                  )}

                  <div className="space-y-3">
                    <button type="button" onClick={requestOtp} disabled={phone.length !== 10 || isChecking}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-base">
                      {isChecking ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                      Send OTP via WhatsApp
                    </button>
                    <button type="button" onClick={() => { setError(null); setStep('pin'); }} disabled={phone.length !== 10}
                      className="w-full bg-[#111c35] hover:bg-[#1a294d] border border-emerald-500/30 text-emerald-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                      <KeyRound className="h-4 w-4" /> Use Fallback PIN Instead
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step: OTP ── */}
              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleOtpVerify} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">6-Digit WhatsApp OTP</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4"><Lock className="h-4 w-4 text-emerald-400" /></div>
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••" maxLength={6}
                        className="w-full bg-[#111c35] border border-emerald-500/30 rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                        required />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">We opened WhatsApp for you. Hit send and we'll immediately reply with your OTP.</p>
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-base">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Verify OTP & Continue
                  </button>
                  <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors">
                    ← Go back
                  </button>
                </motion.form>
              )}

              {/* ── Step: SET-PIN (mandatory after OTP for users with no PIN) ── */}
              {step === 'set-pin' && (
                <motion.form key="set-pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSetPin} className="space-y-5">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-amber-400 font-bold text-sm">🔐 One Last Step!</p>
                    <p className="text-gray-400 text-xs mt-1">Set a 4-digit PIN for quick future logins when WhatsApp OTP is unavailable.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New 4-Digit PIN</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4"><KeyRound className="h-4 w-4 text-amber-400" /></div>
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••" maxLength={4}
                        className="w-full bg-[#111c35] border border-amber-500/30 rounded-xl text-white pl-12 pr-12 py-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                        required />
                      <button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-4 text-gray-500 hover:text-gray-300">
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm PIN</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4"><KeyRound className="h-4 w-4 text-amber-400" /></div>
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••" maxLength={4}
                        className={`w-full bg-[#111c35] border rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal ${
                          confirmPin.length === 4
                            ? confirmPin === newPin ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500/50' : 'border-red-500 focus:ring-1 focus:ring-red-500/50'
                            : 'border-amber-500/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
                        }`}
                        required />
                    </div>
                    {confirmPin.length === 4 && confirmPin !== newPin && (
                      <p className="text-red-400 text-xs mt-1">⚠ PINs don't match</p>
                    )}
                    {confirmPin.length === 4 && confirmPin === newPin && (
                      <p className="text-emerald-400 text-xs mt-1">✓ PINs match</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || newPin.length !== 4 || newPin !== confirmPin}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 text-base">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Save PIN & Enter App
                  </button>

                  <p className="text-center text-xs text-gray-600">Your PIN is encrypted and stored securely. Never share it.</p>
                </motion.form>
              )}

              {/* ── Step: PIN (fallback login) ── */}
              {step === 'pin' && (
                <motion.form key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handlePinLogin} className="space-y-5">
                  {isExistingUser === true && (
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
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">4-Digit Secure PIN</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4"><Lock className="h-4 w-4 text-amber-400" /></div>
                      <input type="password" value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••" maxLength={4}
                        className="w-full bg-[#111c35] border border-amber-500/30 rounded-xl text-white pl-12 pr-4 py-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-xl font-bold tracking-[0.5rem] placeholder:text-gray-600 placeholder:tracking-normal"
                        required />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Use your PIN set during registration. If you forgot it, login via WhatsApp OTP.</p>
                  </div>
                  <button type="submit" disabled={loading || pin.length !== 4}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 text-base">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Sign In with PIN
                  </button>
                  <button type="button" onClick={() => { setError(null); setStep('phone'); }} className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors">
                    ← Go back
                  </button>
                </motion.form>
              )}

            </AnimatePresence>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </motion.p>
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
