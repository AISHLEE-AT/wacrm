"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

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
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (typeof window !== "undefined" && !(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        });
      } catch (err) {
        console.error("Error initializing Recaptcha", err);
      }
    }
  }, []);

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
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpRequested(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending OTP");
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
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
    if (!confirmationResult) {
      setError("No OTP requested. Please start over.");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Bridge Firebase Token to Supabase Session
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
          router.push("/home");
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

          <div id="recaptcha-container"></div>

          {/* WhatsApp OTP Form */}
          <div className="w-full mb-6">
            {!otpRequested ? (
              <form onSubmit={handleRequestOTP} className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Login with Phone (OTP)</label>
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
                  {loading ? "Sending OTP..." : "Get OTP via SMS"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Enter Code</label>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
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
                  onClick={() => {
                    setOtpRequested(false);
                    setOtp("");
                    setConfirmationResult(null);
                  }}
                  className="text-sm text-emerald-500 hover:text-emerald-400 mt-1 font-medium transition-colors"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
          
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

