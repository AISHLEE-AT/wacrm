"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Car, Search, Briefcase, LayoutDashboard, MessageCircle } from "lucide-react";

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
  const [selectedApp, setSelectedApp] = useState<string>("/tradeo");
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setOtpRequested(true);
      if (data.fallbackOtp) {
        setFallbackOtp(data.fallbackOtp);
      }
    } catch (err: any) {
      setError(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
      
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        if (inviteToken) {
          router.push(`/join/${encodeURIComponent(inviteToken)}`);
        } else {
          router.push(selectedApp);
        }
      }
    } catch (err: any) {
      setError(err.message || "Error verifying OTP");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const redirectUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (inviteToken) {
      redirectUrl.searchParams.set("next", `/join/${encodeURIComponent(inviteToken)}`);
    } else {
      redirectUrl.searchParams.set("next", selectedApp);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Branding Side - Hidden on Mobile */}
      <div className="hidden w-1/2 lg:flex flex-col justify-between p-12 bg-emerald-950/10 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <img src="/logo-title.png" alt="TradO Logo" className="h-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-8" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            The next generation of marketplace operations.
          </h2>
          <p className="text-muted-foreground text-lg">
            Connect seamlessly with buyers and sellers on the ultimate marketplace platform powered by real-time intelligence.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} TradO Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative">
        <div className="w-full max-w-[420px] flex flex-col">
          <div className="mb-10 lg:hidden flex justify-center w-full">
            <img src="/logo-title.png" alt="TradO Logo" className="h-12 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3 text-center lg:text-left">
            {inviteToken ? "Accept your invitation" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-10 text-sm text-center lg:text-left">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="w-full mb-6 rounded-xl border border-red-900/50 bg-red-900/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {!inviteToken && (
            <div className="mb-8 w-full">
              <label className="block text-sm font-semibold text-foreground mb-3">Where to?</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedApp("/transo")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedApp === "/transo" ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:text-emerald-400" : "border-border bg-card hover:bg-slate-50 dark:hover:bg-neutral-800 text-muted-foreground"}`}
                >
                  <Car className="h-6 w-6" />
                  <span className="text-xs font-bold">TransO</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedApp("/tradeo")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedApp === "/tradeo" ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:text-emerald-400" : "border-border bg-card hover:bg-slate-50 dark:hover:bg-neutral-800 text-muted-foreground"}`}
                >
                  <Search className="h-6 w-6" />
                  <span className="text-xs font-bold">TradO</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedApp("/drivo")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedApp === "/drivo" ? "border-orange-500 bg-orange-50/50 text-orange-700 dark:text-orange-400" : "border-border bg-card hover:bg-slate-50 dark:hover:bg-neutral-800 text-muted-foreground"}`}
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="text-xs font-bold">DrivO</span>
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp OTP Form */}
          <div className="w-full mb-6">
            {!otpRequested ? (
              <form onSubmit={handleRequestOTP} className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Login with WhatsApp</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-muted-foreground font-medium">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <MessageCircle className="h-5 w-5" />
                  )}
                  {loading ? "Sending OTP..." : "Get OTP via WhatsApp"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-3">
                {fallbackOtp && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl mb-2 text-center shadow-sm">
                    <p className="text-sm font-medium mb-1">Testing Mode</p>
                    <p className="text-xs opacity-80 mb-2">Since WhatsApp delivery is disabled, use this code to login:</p>
                    <div className="text-2xl font-bold tracking-widest font-mono bg-white dark:bg-black/20 py-2 rounded-lg inline-block px-6">
                      {fallbackOtp}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Enter Code</label>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center tracking-[0.5em] text-lg font-mono uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : null}
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <button
                  type="button"
                  onClick={() => setOtpRequested(false)}
                  className="text-sm text-emerald-500 hover:text-emerald-400 mt-1 font-medium transition-colors"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center w-full mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-sm shadow-sm transition-all duration-300 rounded-xl flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
            )}
            {loading ? "Authenticating..." : "Continue with Google"}
          </Button>
          
          <p className="mt-8 text-center lg:text-left text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

