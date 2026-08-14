'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Shield, Car, Users, ArrowRight, Activity, CheckCircle, Clock, Newspaper, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    verifiedDrivers: 0,
    totalProfiles: 0,
    completeProfiles: 0,
    newsCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const [driversRes, profilesRes, newsRes] = await Promise.all([
        supabase.from('drivers').select('id, is_verified', { count: 'exact' }),
        supabase.from('profiles').select('id, profile_complete', { count: 'exact' }),
        supabase.from('daily_news').select('id', { count: 'exact', head: true })
          .gte('loaded_date', new Date(Date.now() - 86400000).toISOString().split('T')[0]),
      ]);

      const totalDrivers = driversRes.count || 0;
      const verifiedDrivers = driversRes.data?.filter((d: any) => d.is_verified).length || 0;
      const totalProfiles = profilesRes.count || 0;
      const completeProfiles = profilesRes.data?.filter((p: any) => p.profile_complete).length || 0;

      setStats({
        totalDrivers,
        verifiedDrivers,
        totalProfiles,
        completeProfiles,
        newsCount: newsRes.count ?? 0,
        loading: false,
      });
    }
    loadStats();
  }, []);

  return (
    <div className="flex h-full flex-col p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Admin Overview
        </h1>
        <p className="text-muted-foreground">
          Platform management, verification workflows, and service provider controls.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Drivers
            </CardTitle>
            <Car className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.loading ? '...' : stats.totalDrivers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered mobility partners
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verified Drivers
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {stats.loading ? '...' : stats.verifiedDrivers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved & active for rides
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.loading ? '...' : stats.totalProfiles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accounts on platform
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Complete Profiles
            </CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {stats.loading ? '...' : stats.completeProfiles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully onboarded accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/drivers" className="group">
          <Card className="h-full border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Car className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-xl">Driver Management</CardTitle>
              <CardDescription>
                Review driver registrations, verify licenses, set vehicle types, manage commission dues, and top up wallet balances.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/providers" className="group">
          <Card className="h-full border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-xl">Service Providers</CardTitle>
              <CardDescription>
                Audit user profiles, inspect onboarding completion status, track contact details, and review role assignments.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/demands" className="group">
          <Card className="h-full border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-500/5 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-xl text-white">Student Exam Demands</CardTitle>
              <CardDescription>
                Live topic requests from Guided Assessment flow. See most requested syllabus topics and launch 1-click WhatsApp release broadcasts.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/daily-news" className="group">
          <Card className="h-full border-blue-500/20 hover:border-blue-400/50 bg-blue-500/5 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    stats.newsCount > 0
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {stats.loading ? '...' : stats.newsCount > 0 ? `${stats.newsCount} items` : 'No news today'}
                  </span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <CardTitle className="text-xl text-blue-100">📰 Daily News Manager</CardTitle>
              <CardDescription>
                Curate and publish daily news for all SuprO modules — AgrO, DealO, JobO, DriveO. Sources: data.gov.in Mandi Prices, Consumer Affairs, and 7 Tamil RSS feeds. Auto-loads at 6 AM IST.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
