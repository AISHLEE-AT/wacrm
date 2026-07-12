"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, CheckCircle, UsersRound } from "lucide-react";

// `useSearchParams` opts the component out of static prerendering
// unless wrapped in Suspense — same pattern as /login.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  // When the user lands here from `/join/<token>` we carry the
  // invite token in the query so it survives the signup → email
  // verification → redirect round-trip. `emailRedirectTo` below
  // points back at /join/<token> so the user lands on the redeem
  // step after verifying instead of being dropped on /dashboard.
  const inviteToken = searchParams.get("invite");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // If we have an invite token, point Supabase's verification
    // email back at the join page so the user can accept after
    // verifying. Without a token, Supabase uses its default
    // redirect (the app root).
    const emailRedirectTo = inviteToken
      ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        {/* Left Branding Side */}
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
          <div className="w-full max-w-[420px] flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-8">
              We've sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Please check your inbox and click the link to verify your account.
            </p>
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full h-12 border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl"
              >
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Branding Side */}
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
          <div className="mb-8 lg:hidden flex justify-center w-full">
            <img src="/logo-title.png" alt="TradO Logo" className="h-12 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          </div>
          
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {inviteToken ? (
              <UsersRound className="h-6 w-6 text-primary" />
            ) : (
              <MessageSquare className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 mt-4">
            {inviteToken ? "Create account & join" : "Create account"}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {inviteToken
              ? "Verify your email, then accept the invitation to join your team."
              : "Get started with TradO Marketplace"}
          </p>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="text-muted-foreground">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center lg:text-left text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
