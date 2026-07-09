"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Laptop, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const redirectUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (inviteToken) {
      redirectUrl.searchParams.set("next", `/join/${encodeURIComponent(inviteToken)}`);
    } else {
      redirectUrl.searchParams.set("next", "/tradeo");
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
    <div className="flex min-h-screen bg-slate-50 overflow-hidden relative">
      {/* WhatsApp Web style top green bar */}
      <div className="absolute top-0 w-full h-[222px] bg-[#00a884]" />

      <div className="relative z-10 w-full max-w-[1050px] mx-auto mt-[40px] mb-[40px] h-[calc(100vh-80px)] min-h-[600px] bg-white rounded-lg shadow-[0_17px_50px_0_rgba(11,20,26,.19),0_12px_15px_0_rgba(11,20,26,.24)] flex overflow-hidden">
        
        {/* Left Side: Branding / Instructions */}
        <div className="flex-1 bg-white p-14 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-light text-slate-800 tracking-wide">Trado<span className="font-bold">Web</span></span>
          </div>

          <h1 className="text-3xl font-light text-slate-700 mb-10">
            {inviteToken ? "Sign in to accept your invitation" : "Use Trado on your computer"}
          </h1>

          <ol className="space-y-6 text-slate-600 text-lg leading-relaxed max-w-sm">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium">1</span>
              <span>Sign in easily using your Google account.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium">2</span>
              <span>Access the Trado Marketplace directly from your browser.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium">3</span>
              <span>Connect seamlessly with buyers and sellers.</span>
            </li>
          </ol>
        </div>

        {/* Right Side: Auth Action */}
        <div className="w-[400px] bg-slate-50 flex flex-col items-center justify-center p-12 border-l border-slate-100">
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            
            <div className="mb-8 relative">
              <div className="w-32 h-32 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                <Laptop className="h-12 w-12 text-slate-300" />
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-50">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-medium text-slate-700 mb-2">Ready to get started?</h2>
            <p className="text-sm text-slate-500 mb-8">
              Click the button below to authenticate with Google and enter the workspace.
            </p>

            {error && (
              <div className="w-full mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
              )}
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
