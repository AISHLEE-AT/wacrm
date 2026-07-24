"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, Loader2, Smartphone, Send } from "lucide-react";
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

  // ───── WhatsApp CRM Instant OTP Handlers ─────
  const handleRequestWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
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
        const { data } = await supabase
          .from("profiles")
          .select("full_name, main_category")
          .eq("phone", clean)
          .maybeSingle();
        if (data) {
          if (data.full_name && !data.full_name.startsWith("User ")) {
            setFullName(data.full_name);
          }
          if (data.main_category) {
            setSelectedCategory(data.main_category);
          }
        }
      } catch (err) {
        console.error("Auto prefill profile error:", err);
      }
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
        body: JSON.stringify({ phone, otp, fullName: fullName.trim(), category: selectedCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      if (data.session) {
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

        const targetRoute = categories.find(c => c.key === selectedCategory)?.route || "/rideo";
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
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        if (inviteToken) {
          router.push(`/join/${encodeURIComponent(inviteToken)}`);
        } else {
          router.push("/");
        }
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
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-2xl" />
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl" />
              <div className="relative z-10 w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_35px_rgba(250,204,21,0.4)]">
                <img src="/app_logo.png" alt="Thamizhan FAGO Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-amber-400 tracking-tight mb-1">
              {inviteToken ? "Accept Invitation" : "தமிழன் • FAGO"}
            </h1>
            
            {!inviteToken && (
              <>
                <p className="text-emerald-400 font-bold tracking-[0.2em] text-xs uppercase mb-2">
                  Thamizhan Growth Engine
                </p>
                <p className="text-white/40 text-[10px] tracking-widest uppercase mb-4 border-t border-white/10 pt-2 px-4">
                  By Aishlee Technology • Official Partner
                </p>
                <p className="text-white/60 text-sm mt-1">
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
                <motion.form 
                  key="phone-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={loginMode === 'whatsapp' ? handleRequestWhatsAppOTP : handleRequestFirebaseOTP} 
                  className="flex flex-col gap-4 w-full"
                >
                  {/* Full Name Input */}
                  <input
                    type="text"
                    placeholder="Your Full Name (பெயர்)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-white text-base placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                  />

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

                  {/* Category Selector Grid */}
                  <div className="flex flex-col gap-2 my-1">
                    <label className="text-xs font-semibold text-white/70">Select Your Goal (வகைப்பாடு):</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setSelectedCategory(cat.key)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl transition text-left border ${
                            selectedCategory === cat.key
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
