"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsAdmin } from "@/lib/auth/admin";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Smartphone, Lock, ArrowRight, Loader2, Send, UserCheck, ShieldCheck, RefreshCw } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

const CATEGORIES = [
  { key: 'Traveller',  label: '🧳 Traveller (RideO)',     route: '/rideo' },
  { key: 'Farmer',    label: '🚜 Farmer (RentO Agri)',   route: '/rento' },
  { key: 'Shopper',   label: '🛍️ Shopper (DealO)',       route: '/dealo' },
  { key: 'Driver',    label: '🚖 Driver (DriveO)',        route: '/drivo' },
  { key: 'Student',   label: '🎓 Student (TeachO)',       route: '/teacho' },
  { key: 'Teacher',   label: '👨🏫 Teacher (TeachO)',      route: '/teacho' },
  { key: 'Financier', label: '💰 Financier (MoneyO)',    route: '/moneyo' },
  { key: 'JobSeeker', label: '💼 Job Seeker',            route: '/teacho' },
  { key: 'Employer',  label: '🏢 Employer (BizHub)',     route: '/' },
  { key: 'Tourist',   label: '🛕 Tourist (TourO)',        route: '/touro' },
];

type Step = 'phone' | 'whatsapp-verify' | 'otp' | 'pin' | 'newuser';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Traveller');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Inbound WhatsApp Verification state
  const [pollId, setPollId] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [pollTimer, setPollTimer] = useState<number>(600); // 10 mins

  // Returning user state
  const [isReturning, setIsReturning] = useState(false);
  const [returnName, setReturnName] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const supabase = createClient();

  // Check for existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/');
    });
  }, []);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Polling effect for WhatsApp Inbound Verification
  useEffect(() => {
    if (step !== 'whatsapp-verify' || !pollId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/whatsapp/poll-session?poll_id=${pollId}`);
        const data = await res.json();
        if (res.ok && data.status === 'verified') {
          clearInterval(interval);
          setInfo("WhatsApp verification confirmed! Logging in...");
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          handlePostLogin(data);
        } else if (data.status === 'expired') {
          clearInterval(interval);
          setError("Verification session expired. Please try again or use OTP.");
          setStep('phone');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2500);

    const countdown = setInterval(() => {
      setPollTimer(t => {
        if (t <= 1) {
          clearInterval(countdown);
          clearInterval(interval);
          setStep('phone');
          setError('Verification timed out. Please try again.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [step, pollId]);

  // Phone change handler — auto-detect returning user
  const handlePhoneChange = useCallback(async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setError(null);
    setIsReturning(false);
    setReturnName('');
    setHasPin(false);
    setStep('phone');

    if (clean.length === 10) {
      setCheckingPhone(true);
      try {
        const res = await fetch(`/api/fago/search?phone=${clean}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.profile?.full_name) {
            setIsReturning(true);
            setReturnName(json.profile.full_name);
            setFullName(json.profile.full_name);
            setCategory(json.profile.main_category || 'Traveller');
            setHasPin(!!(json.profile.pin_hash));
            return;
          }
        }
        // Fallback direct Supabase
        const { data } = await supabase
          .from('profiles')
          .select('full_name, main_category, pin_hash')
          .or(`phone.eq.${clean},phone.eq.91${clean},whatsapp.eq.${clean},whatsapp.eq.91${clean}`)
          .limit(1);
        const p = data?.[0];
        if (p?.full_name) {
          setIsReturning(true);
          setReturnName(p.full_name);
          setFullName(p.full_name);
          setCategory(p.main_category || 'Traveller');
          setHasPin(!!(p.pin_hash));
        }
      } catch { /* silent */ } finally {
        setCheckingPhone(false);
      }
    }
  }, []);

  // Route after successful login
  const handlePostLogin = useCallback((data: any) => {
    const target = inviteToken
      ? `/join/${encodeURIComponent(inviteToken)}`
      : (data.redirect_to || (data.isAdmin ? '/crm' : '/rideo'));
    window.location.href = target;
  }, [inviteToken]);

  // Initiate Inbound WhatsApp Login (OTPLess)
  const handleInitWhatsAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) { setError('Enter a valid 10-digit WhatsApp number'); return; }
    if (!isReturning && !fullName.trim()) { setError('Please enter your Full Name'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/whatsapp/init-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, fullName: fullName.trim(), category })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start WhatsApp login');

      setPollId(data.poll_id);
      setDeepLinkUrl(data.deep_link_url);
      setPollTimer(600);
      setStep('whatsapp-verify');

      // Auto open deep link in window
      if (data.deep_link_url) {
        window.open(data.deep_link_url, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) { setError('Enter a valid 10-digit WhatsApp number'); return; }
    if (!isReturning && !fullName.trim()) { setError('Please enter your Full Name'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/whatsapp/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      // Sync returning user data from server
      if (data.is_returning_user && data.full_name) {
        setIsReturning(true);
        setReturnName(data.full_name);
        setFullName(data.full_name);
        if (data.main_category) setCategory(data.main_category);
        setHasPin(data.has_pin);
      }

      setCooldown(60);
      setStep('otp');
      setInfo(`OTP sent to WhatsApp +91 ${phone}! Check your messages.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/whatsapp/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, fullName: fullName.trim(), category, pin: newPin || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      handlePostLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // PIN login
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length !== 4) { setError('Enter your 4-digit PIN'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/pin-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.need_otp) {
          setStep('otp');
          setError('Please verify via OTP first to set your PIN.');
          return;
        }
        throw new Error(data.error || 'PIN login failed');
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      handlePostLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green-900/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#0d1526]/90 backdrop-blur-xl border border-green-500/20 rounded-3xl shadow-2xl shadow-green-500/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/10 border-b border-green-500/20 px-8 py-7 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-2xl font-black text-white">F</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-white tracking-tight">FAGO</h1>
                <p className="text-green-400 text-xs font-medium">தமிழன் AISHO</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">WhatsApp Verified • One Login • All Platforms</p>
          </div>

          <div className="px-8 py-7 space-y-5">
            <AnimatePresence mode="wait">
              {/* ──── STEP: PHONE ──── */}
              {step === 'phone' && (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={isReturning && hasPin ? (e) => { e.preventDefault(); setStep('pin'); } : handleSendOTP}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      WhatsApp Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-400 font-bold text-sm">+91</span>
                        <div className="w-px h-4 bg-green-500/30" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="10-digit number"
                        maxLength={10}
                        className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white pl-28 pr-4 py-3.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-base placeholder:text-gray-600"
                        required
                      />
                      <span className="absolute right-4 text-xs text-gray-500">{phone.length}/10</span>
                    </div>
                  </div>

                  {/* Returning user welcome */}
                  <AnimatePresence>
                    {isReturning && returnName && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                      >
                        <UserCheck className="h-5 w-5 text-green-400 shrink-0" />
                        <div>
                          <p className="text-green-300 font-semibold text-sm">Welcome back, {returnName}! 👋</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {hasPin ? 'Login with your 4-digit PIN or get OTP' : 'Send OTP to continue'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* New user name + category */}
                  <AnimatePresence>
                    {!isReturning && phone.length === 10 && !checkingPhone && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Your full name (பெயர்)"
                            className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white px-4 py-3.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Primary Goal</label>
                          <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white px-4 py-3.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all appearance-none"
                          >
                            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                  <div className="space-y-2 pt-1">
                    {isReturning && hasPin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep('pin')}
                          disabled={loading || phone.length !== 10}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                        >
                          <Lock className="h-4 w-4" /> Login with PIN
                        </button>
                        <button
                          type="submit"
                          onClick={handleInitWhatsAppLogin}
                          disabled={loading || phone.length !== 10}
                          className="w-full bg-[#111c35] border border-green-500/30 hover:border-green-500/60 text-green-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Login via WhatsApp (Instant Verification)
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading || phone.length !== 10 || cooldown > 0}
                          className="w-full text-gray-500 hover:text-gray-400 text-xs py-1 text-center"
                        >
                          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Or send 6-digit OTP code'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="submit"
                          onClick={handleInitWhatsAppLogin}
                          disabled={loading || phone.length !== 10 || checkingPhone}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5 text-white" />}
                          Login with WhatsApp (Instant)
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading || phone.length !== 10 || cooldown > 0}
                          className="w-full bg-[#111c35] border border-green-500/30 hover:border-green-500/60 text-gray-300 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Get 6-Digit OTP Code instead'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.form>
              )}

              {/* ──── STEP: WHATSAPP-VERIFY ──── */}
              {step === 'whatsapp-verify' && (
                <motion.div
                  key="whatsapp-verify"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-5 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20 animate-pulse">
                    <MessageCircle className="h-8 w-8 text-green-400" />
                  </div>

                  <div>
                    <h2 className="text-white font-bold text-xl">Verify via WhatsApp</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Tap below to open WhatsApp and send the pre-typed verification code.
                    </p>
                  </div>

                  <div className="bg-[#111c35] border border-green-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                      <span>Target Phone:</span>
                      <span className="text-green-400 font-mono font-bold">+91 {phone}</span>
                    </div>
                    
                    {deepLinkUrl && (
                      <a
                        href={deepLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 text-base"
                      >
                        <MessageCircle className="h-5 w-5 fill-black" />
                        Open WhatsApp & Send Code
                      </a>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full" />
                      <span className="text-xs text-green-300 font-medium">Waiting for message verification...</span>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Session expires in {Math.floor(pollTimer / 60)}m {pollTimer % 60}s
                    </p>
                  </div>

                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                  {info && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{info}</p>}

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full text-green-400 hover:underline text-xs font-medium"
                    >
                      Didn't work? Send 6-digit OTP code instead
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStep('phone'); setError(null); }}
                      className="w-full text-gray-400 hover:text-white text-xs"
                    >
                      ← Change phone number
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ──── STEP: PIN ──── */}
              {step === 'pin' && (
                <motion.form
                  key="pin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePinLogin}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-7 w-7 text-green-400" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Welcome back, {returnName || 'User'}!</h2>
                    <p className="text-gray-400 text-sm mt-1">Enter your 4-digit PIN to login instantly</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">4-Digit Quick PIN</label>
                    <input
                      type="password"
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white px-4 py-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-center text-2xl tracking-[1rem] font-bold placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal"
                      autoFocus
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || pin.length !== 4}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Verify PIN & Login
                  </button>

                  <button type="button" onClick={() => { setStep('phone'); setPin(''); setError(null); }}
                    className="w-full text-gray-400 hover:text-green-400 text-sm transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5" /> Use WhatsApp OTP instead
                  </button>
                </motion.form>
              )}

              {/* ──── STEP: OTP ──── */}
              {step === 'otp' && (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-7 w-7 text-green-400" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Enter OTP</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Sent to WhatsApp <span className="text-green-400 font-semibold">+91 {phone}</span>
                    </p>
                  </div>

                  {info && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">{info}</p>}

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">6-Digit OTP</label>
                    <input
                      type="tel"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white px-4 py-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-center text-2xl tracking-[0.5rem] font-bold placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal"
                      autoFocus
                    />
                  </div>

                  {/* Optional: Set PIN for next time */}
                  {!isReturning && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Set 4-Digit PIN <span className="text-gray-500 font-normal">(optional, for faster login next time)</span></label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        maxLength={4}
                        className="w-full bg-[#111c35] border border-green-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all text-center text-xl tracking-[0.8rem] font-bold placeholder:text-gray-600 placeholder:text-sm placeholder:tracking-normal"
                      />
                    </div>
                  )}

                  {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Verify & Login
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(null); setInfo(null); }}
                      className="text-gray-400 hover:text-white transition-colors">← Change number</button>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={cooldown > 0 || loading}
                      className="text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="pt-4 border-t border-green-500/10 text-center">
              <p className="text-gray-600 text-xs">
                By logging in, you agree to our{' '}
                <a href="/terms" className="text-green-500 hover:underline">Terms</a>{' '}and{' '}
                <a href="/privacy" className="text-green-500 hover:underline">Privacy Policy</a>
              </p>
              <p className="text-gray-700 text-xs mt-2">வாழ்க • வளர்க • வெல்க 🌿</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recaptcha container (invisible, for Firebase fallback) */}
      <div id="recaptcha-container" />
    </div>
  );
}
