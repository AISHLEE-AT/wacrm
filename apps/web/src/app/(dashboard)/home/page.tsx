"use client";

import Link from "next/link";
import { Car, Search, Briefcase, Zap, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SuperAppHome() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-black to-neutral-800 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500 bg-neutral-900">
            <Zap className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super App</h1>
            <p className="text-neutral-400">Your world in one place</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-foreground">What do you need today, {profile?.full_name?.split(' ')[0] || 'there'}?</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* TransO Card */}
        <Link href="/transo" className="group block overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <Car className="h-10 w-10 text-emerald-600 transition-transform group-hover:scale-110" />
            <span className="rounded-full bg-emerald-200/50 px-3 py-1 text-xs font-bold text-emerald-800">TransO</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-emerald-900">Book a Ride</h3>
          <p className="text-sm leading-relaxed text-emerald-700">Fast and reliable rides for your daily commute. Auto, Bike, and Cabs.</p>
        </Link>

        {/* TradO Card */}
        <Link href="/tradeo" className="group block overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-200 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <Search className="h-10 w-10 text-slate-800 transition-transform group-hover:scale-110" />
            <span className="rounded-full bg-slate-300 px-3 py-1 text-xs font-bold text-slate-800">TradO</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">Hire a Service</h3>
          <p className="text-sm leading-relaxed text-slate-700">Find plumbers, electricians, catering, and more near you.</p>
        </Link>

        {/* DrivO Card */}
        <Link href="/drivo" className="group block overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <Briefcase className="h-10 w-10 text-orange-600 transition-transform group-hover:scale-110" />
            <span className="rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-800">DrivO</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-orange-900">Drive & Earn</h3>
          <p className="text-sm leading-relaxed text-orange-700">Register your vehicle and start earning by driving for TransO.</p>
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <Shield className="h-8 w-8 text-emerald-500" />
        <div>
          <h4 className="font-bold text-foreground">Safe & Secure</h4>
          <p className="text-sm text-muted-foreground">All our drivers and service providers are verified for your safety.</p>
        </div>
      </div>
    </div>
  );
}
