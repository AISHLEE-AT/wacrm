"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, Loader2, Smartphone, Send, Lock, UserCheck } from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [loginMode, setLoginMode] = useState<"whatsapp" | "firebase">("whatsapp");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Traveller");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const [isReturningUser, setIsReturningUser] = useState(false);
  const [pin, setPin] = useState("");
  const [hasSavedPin, setHasSavedPin] = useState(false);
  const [isPinLogin, setIsPinLogin] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");

  const categories = [
    { key: 'Traveller', label: '🧳 Traveller (பயணி - RideO)', route: '/rideo' },
    { key: 'Farmer', label: '🚜 Farmer (விவசாயி - RentO)', route: '/rento' },
    { key: 'Shopper', label: '🛍️ Shopper (வியாபாரி / பொருட்கள் - DealO)', route: '/dealo' },
    { key: 'Driver', label: '🚖 Driver (ஓட்டுநர் - DriveO)', route: '/drivo' },
    { key: 'Student', label: '🎓 Student (மாணவர் - TeachO)', route: '/teacho' },
    { key: 'Teacher', label: '👨‍🏫 Teacher (ஆசிரியர் - TeachO)', route: '/teacho' },
    { key: 'Financier', label: '💰 Financier (நிதியாளர் - LoanO)', route: '/mandi' },
    { key: 'JobSeeker', label: '💼 Job Seeker (வேலைதேடுவோர்)', route: '/teacho' },
    { key: 'Employer', label: '🏢 Employer (நிறுவனம்)', route: '/' },
    { key: 'Tourist', label: '🛕 Tourist (சுற்றுலா - TourO)', route: '/touro' },
  ];
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initialize reCAPTCHA verifier for Firebase SMS OTP
    if (typeof window !== "undefined" && !(window as any).recaptchaVerifier) {
      Promise.all([
        import("@/lib/firebase"),
        import("firebase/auth")
      ]).then(([firebaseModule, authModule]) => {
        const auth = firebaseModule.auth;
        const RecaptchaVerifier = authModule.RecaptchaVerifier;
        try {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {},
          });
        } catch (err) {
          console.error("Error initializing Recaptcha", err);
        }
      }).catch(err => {
        console.error("Failed to load Firebase auth", err);
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const phoneParam = urlParams.get('phone');
      if (phoneParam) {
        const clean = phoneParam.replace(/\D/g, '').slice(-10);
        if (clean.length === 10) {
          handlePhoneChange(clean);
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              router.push('/');
            }
          });
        }
      }
    }
  }, []);

  // ───── WhatsApp CRM Instant OTP Handlers ─────
  const handleRequestWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isReturningUser && !fullName.trim()) {
      setError("Please enter your Full Name");
      return;
    }
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send WhatsApp OTP");
      setOtpRequested(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending WhatsApp OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    if (clean.length === 10) {
      try {
        const { data: records } = await supabase
          .from("profiles")
          .select("full_name, main_category")
          .or(`phone.eq.${clean},phone.eq.91${clean},phone.eq.+91${clean},email.eq.${clean}@whatsapp.wacrm.local`);
        
        const data = records?.[0];

        const savedPin = typeof window !== "undefined" ? localStorage.getItem("fago_pin_" + clean) : null;

        if (data) {
          setIsReturningUser(true);
          if (data.full_name) {
            setFullName(data.full_name);
          }
          if (data.main_category) {
            setSelectedCategory(data.main_category);
          }
          // Enable PIN login mode by default for returning registered accounts across any browser
          setHasSavedPin(true);
          setIsPinLogin(true);
        } else {
          setIsReturningUser(false);
          setHasSavedPin(false);
          setIsPinLogin(false);
        }
      } catch (err) {
        console.error("Auto prefill profile error:", err);
        setIsReturningUser(false);
        setHasSavedPin(false);
        setIsPinLogin(false);
      }
    } else {
      setIsReturningUser(false);
      setHasSavedPin(false);
      setIsPinLogin(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin || pin.length !== 4) {
      setError("Please enter your 4-digit PIN");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authenticate PIN login");

      if (data.session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("fago_pin_" + phone, pin);
        }

        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        const userCat = data.category || selectedCategory;
        const isAdminUser = data.role === "admin" || data.isAdmin || phone === "9486335870" || phone === "919486335870" || phone.endsWith("9486335870");
        const isDriverUser = data.role === "driver" || data.isDriver || userCat === "Driver";
        const targetRoute = isAdminUser ? "/crm" : (isDriverUser ? "/drivo" : (categories.find(c => c.key === userCat)?.route || "/rideo"));
        const finalUrl = inviteToken ? `/join/${encodeURIComponent(inviteToken)}` : targetRoute;
        window.location.href = finalUrl;
      } else {
        throw new Error("Invalid session data returned from server");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error during PIN login");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, fullName: fullName.trim(), category: selectedCategory, pin: newPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      if (data.session) {
        if (newPin && newPin.length === 4) {
          localStorage.setItem("fago_pin_" + phone, newPin);
        }

        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (data.session.user) {
          await supabase.from("profiles").upsert({
            id: data.session.user.id,
            phone: phone,
            whatsapp: phone,
            full_name: fullName.trim() || "User",
            main_category: selectedCategory,
          });
        }

        const isAdminUser = data.role === "admin" || data.isAdmin || phone === "9486335870" || phone === "919486335870" || phone.endsWith("9486335870");
        const isDriverUser = data.role === "driver" || data.isDriver || selectedCategory === "Driver";
        const targetRoute = isAdminUser ? "/crm" : (isDriverUser ? "/drivo" : (categories.find(c => c.key === selectedCategory)?.route || "/rideo"));
        const finalUrl = inviteToken ? `/join/${encodeURIComponent(inviteToken)}` : targetRoute;
        window.location.href = finalUrl;
      } else {
        throw new Error("Invalid session payload");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  // ───── Firebase Phone SMS OTP Handlers ─────
  const handleRequestFirebaseOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const firebaseModule = await import("@/lib/firebase");
      const authModule = await import("firebase/auth");
      const auth = firebaseModule.auth;
      const signInWithPhoneNumber = authModule.signInWithPhoneNumber;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpRequested(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending SMS OTP");
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFirebaseOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!confirmationResult) {
      setError("No OTP requested. Please start over.");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/firebase-bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseToken: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to bridge auth");
      
      if (data.access_token && data.refresh_token) {
        if (newPin && newPin.length === 4) {
          localStorage.setItem("fago_pin_" + phone, newPin);
        }

        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        const isAdminUser = data.role === "admin" || data.isAdmin || phone === "9486335870" || phone === "919486335870" || phone.endsWith("9486335870");
        const isDriverUser = data.role === "driver" || data.isDriver || selectedCategory === "Driver";
        const targetRoute = isAdminUser ? "/crm" : (isDriverUser ? "/drivo" : (categories.find(c => c.key === selectedCategory)?.route || "/rideo"));
        const finalUrl = inviteToken ? `/join/${encodeURIComponent(inviteToken)}` : targetRoute;
        window.location.href = finalUrl;
      } else {
        throw new Error("Invalid session data from bridge");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppDirectMsgUrl = () => {
    const text = `Hello FAGO Support, my name is ${fullName || 'User'} (${selectedCategory}). Please reply with my Login OTP for mobile +91 ${phone || 'YOUR_PHONE'}`;
    return `https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#000000]">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-600/30 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-cyan-600/20 blur-[160px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="relative flex items-center justify-center w-36 h-36 mb-5">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-2xl" />
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl" />
              <div className="relative z-10 w-32 h-32 rounded-3xl overflow-hidden border border-amber-400/60 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                <img src="/brand-leaf-logo.png?v=3" alt="Thamizhan FAGO Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {!inviteToken && (
              <span className="text-sm font-bold text-emerald-400 tracking-[0.2em] uppercase mb-0.5">
                தமிழன்
              </span>
            )}

            <h1 className="text-5xl font-black text-amber-400 tracking-wider leading-none mb-2">
              {inviteToken ? "Accept Invitation" : "FAGO"}
            </h1>
            
            {!inviteToken && (
              <>
                <p className="text-emerald-400 font-extrabold tracking-[0.2em] text-xs uppercase mb-3">
                  வாழ்க • வளர்க • வெல்க
                </p>
                <p className="text-white/40 text-[10px] tracking-widest uppercase border-t border-white/10 pt-2 px-4">
                  By Aishlee Technology • Official Partner
                </p>
                <p className="text-white/60 text-sm mt-3">
                  Instant WhatsApp OTP Verification
                </p>
              </>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="w-full mb-6 overflow-hidden"
              >
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 text-center backdrop-blur-md">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div id="recaptcha-container"></div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {!otpRequested ? (
                isPinLogin && hasSavedPin ? (
                  <motion.form 
                    key="pin-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handlePinLogin}
                    className="flex flex-col gap-4 w-full"
                  >
                    {/* Phone Input */}
                    <div className="relative flex items-center group">
                      <span className="absolute left-5 text-white/40 font-medium text-lg transition-colors group-focus-within:text-white/70">+91</span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full h-14 pl-16 pr-5 rounded-2xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                      />
                    </div>

                    {/* Welcome Back Badge for Returning User */}
                    {isReturningUser && (
                      <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm text-center w-full">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-base">
                          <UserCheck className="w-5 h-5" />
                          <span>Welcome back, {fullName}! 👋</span>
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {categories.find(c => c.key === selectedCategory)?.label || selectedCategory}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReturningUser(false);
                            setHasSavedPin(false);
                            setIsPinLogin(false);
                            setFullName("");
                            setPhone("");
                          }}
                          className="text-xs text-white/50 hover:text-white underline underline-offset-2 transition-colors mt-1"
                        >
                          Not {fullName}? Switch user
                        </button>
                      </div>
                    )}

                    {/* 4-Digit Quick PIN Input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/70 text-center">Enter 4-Digit Quick PIN:</label>
                      <input
                        type="password"
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="w-full h-16 px-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-center tracking-[1em] text-2xl font-mono backdrop-blur-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || pin.length !== 4}
                      className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-base font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin opacity-80" />
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Sign In with PIN
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setIsPinLogin(false)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors p-2 text-center"
                    >
                      Login via WhatsApp OTP instead
                    </button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="phone-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={loginMode === 'whatsapp' ? handleRequestWhatsAppOTP : handleRequestFirebaseOTP} 
                    className="flex flex-col gap-4 w-full"
                  >
                    {/* 1. Phone Input Field — FIRST INPUT BOX */}
                    <div className="relative flex items-center group">
                      <span className="absolute left-5 text-white/40 font-medium text-lg transition-colors group-focus-within:text-white/70">+91</span>
                      <input
                        type="tel"
                        placeholder="Mobile WhatsApp Number (98765 43210)"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full h-14 pl-16 pr-5 rounded-2xl border border-emerald-500/30 bg-white/5 text-white text-lg placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all backdrop-blur-sm font-semibold"
                      />
                    </div>

                    {/* 2. Full Name Input for non-returning users */}
                    {!isReturningUser && (
                      <input
                        type="text"
                        placeholder="Your Full Name (பெயர்)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-white text-base placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                      />
                    )}

                    {/* Category Selector Dropdown for non-returning users */}
                    {!isReturningUser && (
                      <div className="flex flex-col gap-2 my-1">
                        <label className="text-xs font-semibold text-white/70">Select Your Goal (வகைப்பாடு):</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-white text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
                        >
                          {categories.map((cat) => (
                            <option key={cat.key} value={cat.key} className="bg-zinc-900 text-white py-2">
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quick PIN setup field if user doesn't have a saved PIN */}
                    {!hasSavedPin && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-white/70">Set 4-Digit Quick PIN (Optional):</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-white text-base placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all backdrop-blur-sm tracking-widest text-center"
                        />
                      </div>
                    )}

                    {/* Switch back to PIN login if returning user or saved PIN exists */}
                    {(hasSavedPin || isReturningUser) && (
                      <button
                        type="button"
                        onClick={() => setIsPinLogin(true)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-center"
                      >
                        Use 4-Digit Quick PIN instead
                      </button>
                    )}

                    {loginMode === 'whatsapp' ? (
                      <a
                        href={getWhatsAppDirectMsgUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (phone.length === 10) setOtpRequested(true);
                        }}
                        className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-lg group"
                      >
                        <Send className="w-5 h-5" />
                        Get Instant OTP via WhatsApp
                      </a>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading || phone.length !== 10}
                        className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all text-base font-semibold shadow-lg group flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin opacity-80" />
                        ) : (
                          <>
                            Request SMS OTP
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 opacity-70" />
                          </>
                        )}
                      </Button>
                    )}
                  </motion.form>
                )
              ) : (
                <motion.form 
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={loginMode === 'whatsapp' ? handleVerifyWhatsAppOTP : handleVerifyFirebaseOTP} 
                  className="flex flex-col gap-4 w-full"
                >
                  <div className="flex flex-col gap-2 text-center mb-1">
                    <p className="text-sm text-white/60">
                      Enter the 6-digit code sent to <span className="text-white font-medium">+91 {phone}</span> via {loginMode === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full h-16 px-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-center tracking-[1em] text-2xl font-mono backdrop-blur-sm"
                  />
                  
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all text-base font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-black/50" />
                    ) : (
                      "Verify Code & Sign In"
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequested(false);
                      setOtp("");
                      setConfirmationResult(null);
                    }}
                    className="text-sm text-white/50 hover:text-white mt-1 font-medium transition-colors p-2 text-center"
                  >
                    Use a different number or method
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8 text-center w-full"
          >
            <p className="text-xs text-white/30">
              By continuing, you agree to our <br/>
              <a href="/terms" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">Terms of Service</a> and <a href="/privacy" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
