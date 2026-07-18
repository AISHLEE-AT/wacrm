"use client";

import Link from "next/link";
import { Car, Search, Briefcase, Zap, Shield, Sparkles, ChevronRight, Activity, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function SuperAppHome() {
  const { profile } = useAuth();
  const userName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative min-h-screen">
      
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden mb-12 rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/10 p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-black/50 backdrop-blur-xl">
                <Zap className="h-10 w-10 text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-amber-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ stroke: "url(#gradient)" }} />
                <svg width="0" height="0">
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop stopColor="#34d399" offset="0%" />
                    <stop stopColor="#fbbf24" offset="100%" />
                  </linearGradient>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 mb-2">
                FAGO <span className="text-amber-400 font-black">LETSGO</span>
              </h1>
              <p className="text-lg text-emerald-400 font-medium tracking-wide">Your world in one immersive place</p>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 text-neutral-400 mb-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Location Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl font-bold mb-8 text-white tracking-tight"
      >
        What do you need today, <span className="text-emerald-400">{userName}</span>?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* RidO Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Link href="/transo" className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-md p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] hover:border-emerald-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Car className="w-8 h-8 text-white" />
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-sm">RidO</span>
            </div>
            
            <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Book a Ride</h3>
            <p className="relative z-10 text-neutral-400 leading-relaxed mb-6">Experience fast, premium, and reliable rides for your daily commute. Auto, Bike, and Cabs at your fingertips.</p>
            
            <div className="relative z-10 flex items-center text-emerald-500 font-semibold text-sm group-hover:gap-2 transition-all">
              Explore Rides <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>

        {/* FAGO Hub Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Link href="/fago" className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-md p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:border-blue-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                <Search className="w-8 h-8 text-white" />
              </div>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-400 backdrop-blur-sm">FAGO Hub</span>
            </div>
            
            <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Hire a Service</h3>
            <p className="relative z-10 text-neutral-400 leading-relaxed mb-6">Discover top-rated plumbers, electricians, catering, and exclusive local services verified just for you.</p>
            
            <div className="relative z-10 flex items-center text-blue-500 font-semibold text-sm group-hover:gap-2 transition-all">
              Find Services <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>

        {/* DrivO Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Link href="/drivo" className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-md p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] hover:border-amber-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-sm">DrivO</span>
            </div>
            
            <h3 className="relative z-10 text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Drive & Earn</h3>
            <p className="relative z-10 text-neutral-400 leading-relaxed mb-6">Partner with us. Register your vehicle, set your own schedule, and start earning premium rates instantly.</p>
            
            <div className="relative z-10 flex items-center text-amber-500 font-semibold text-sm group-hover:gap-2 transition-all">
              Start Earning <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 flex flex-col md:flex-row items-center gap-6 rounded-3xl border border-white/5 bg-neutral-900/30 p-8 backdrop-blur-md"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-1">Safe & Secure Ecosystem</h4>
          <p className="text-neutral-400 max-w-2xl leading-relaxed">We employ enterprise-grade verification for all our drivers and service providers. Your safety and data security are our highest priority.</p>
        </div>
      </motion.div>
    </div>
  );
}
