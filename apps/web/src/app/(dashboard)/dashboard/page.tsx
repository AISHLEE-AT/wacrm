// @ts-nocheck
"use client"

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/currency'
import {
  MessageSquare,
  UserPlus,
  DollarSign,
  Send,
  Car,
  Tractor,
  FileCheck,
  Zap,
  Flame,
  Award,
  Globe,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

import {
  loadActivity,
  loadConversationsSeries,
  loadMetrics,
  loadPipelineDonut,
  loadResponseTime,
} from '@/lib/dashboard/queries'
import type {
  ActivityItem,
  ConversationsSeriesPoint,
  MetricsBundle,
  PipelineDonutData,
  ResponseTimeSummary,
} from '@/lib/dashboard/types'

import { useRouter } from 'next/navigation'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SkeletonCard } from '@/components/dashboard/skeleton'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { PipelineDonut } from '@/components/dashboard/pipeline-donut'
import { ResponseTimeChart } from '@/components/dashboard/response-time-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { TamilVoiceSearch } from '@/components/layout/TamilVoiceSearch'

import { checkIsAdmin } from '@/lib/auth/admin'

type RangeDays = 7 | 30 | 90

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, defaultCurrency } = useAuth()

  const isAdmin = checkIsAdmin(user, profile)

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/rideo')
    }
  }, [user, isAdmin, router])

  const [metrics, setMetrics] = useState<MetricsBundle | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)

  const [range, setRange] = useState<RangeDays>(30)
  const [series, setSeries] = useState<Record<RangeDays, ConversationsSeriesPoint[] | null>>({
    7: null,
    30: null,
    90: null,
  })
  const [seriesLoading, setSeriesLoading] = useState(true)

  const [pipeline, setPipeline] = useState<PipelineDonutData | null>(null)
  const [pipelineLoading, setPipelineLoading] = useState(true)

  const [responseTime, setResponseTime] = useState<ResponseTimeSummary | null>(null)
  const [responseTimeLoading, setResponseTimeLoading] = useState(true)

  const [activity, setActivity] = useState<ActivityItem[] | null>(null)
  const [activityLoading, setActivityLoading] = useState(true)

  const loadAll = useCallback(() => {
    const db = createClient()

    void loadMetrics(db)
      .then((m) => setMetrics(m))
      .catch((err) => console.error('[dashboard] metrics failed:', err))
      .finally(() => setMetricsLoading(false))

    void loadConversationsSeries(db, 30)
      .then((s) => setSeries((prev) => ({ ...prev, 30: s })))
      .catch((err) => console.error('[dashboard] series failed:', err))
      .finally(() => setSeriesLoading(false))

    void loadPipelineDonut(db)
      .then((p) => setPipeline(p))
      .catch((err) => console.error('[dashboard] pipeline failed:', err))
      .finally(() => setPipelineLoading(false))

    void loadResponseTime(db)
      .then((r) => setResponseTime(r))
      .catch((err) => console.error('[dashboard] response time failed:', err))
      .finally(() => setResponseTimeLoading(false))

    void loadActivity(db, 50)
      .then((a) => setActivity(a))
      .catch((err) => console.error('[dashboard] activity failed:', err))
      .finally(() => setActivityLoading(false))
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleRangeChange = useCallback(
    (r: RangeDays) => {
      setRange(r)
      if (series[r] !== null) return
      setSeriesLoading(true)
      const db = createClient()
      loadConversationsSeries(db, r)
        .then((s) => setSeries((prev) => ({ ...prev, [r]: s })))
        .catch((err) => console.error('[dashboard] series failed:', err))
        .finally(() => setSeriesLoading(false))
    },
    [series],
  )

  return (
    <div className="space-y-6">
      {/* Header Bar with Tamil Voice Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            FAGO Super App Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            0% Commission Mobility, Agri Equipment, AI Tutor & WhatsApp CRM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TamilVoiceSearch />
          <a
            href="https://wa.me/916381029380?text=Hi%20FAGO%20Help"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <MessageCircle className="w-4 h-4" /> 24/7 WhatsApp Help
          </a>
        </div>
      </div>

      {/* 🚀 QUICK ACTION HUB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '🚗 RideO Taxi (பயணம்)', route: '/rideo', color: 'from-blue-600 to-indigo-600' },
          { label: '🚜 RentO Agri (கருவிகள்)', route: '/rento', color: 'from-amber-600 to-orange-600' },
          { label: '📝 TestO Mock Exam (தேர்வு)', route: '/testo', color: 'from-purple-600 to-pink-600' },
          { label: '🤖 Gemini AI (தமிழ் AI)', route: '/ai-assistant', color: 'from-emerald-600 to-cyan-600' },
        ].map((item) => (
          <button
            key={item.route}
            onClick={() => router.push(item.route)}
            className={`p-4 rounded-2xl bg-gradient-to-r ${item.color} text-white font-black text-xs md:text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition text-left flex items-center justify-between`}
          >
            <span>{item.label}</span>
            <Sparkles className="w-4 h-4 opacity-80" />
          </button>
        ))}
      </div>

      {/* 🪙 MONEYO STREAK REWARDS BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              MoneyO 7-Day Login Streak • தினசரி புள்ளிகள்
            </h3>
            <p className="text-xs text-slate-400">
              Log in daily to earn +10 MoneyO Coins (Current Streak: 3 Days 🔥)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map((d, idx) => (
            <div
              key={d}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border ${
                idx < 3
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              title="Active Conversations"
              value={metrics.activeConversations.current.toLocaleString()}
              icon={MessageSquare}
              delta={{
                sign: metrics.activeConversations.previous,
                label: deltaLabel(metrics.activeConversations.previous, 'new today vs yesterday'),
              }}
            />
            <MetricCard
              title="New Contacts Today"
              value={metrics.newContactsToday.current.toLocaleString()}
              icon={UserPlus}
              delta={{
                sign: metrics.newContactsToday.current - metrics.newContactsToday.previous,
                label: deltaLabel(
                  metrics.newContactsToday.current - metrics.newContactsToday.previous,
                  'vs yesterday',
                ),
              }}
            />
            <MetricCard
              title="Open Deals Value"
              value={formatCurrency(metrics.openDealsValue, defaultCurrency)}
              icon={DollarSign}
              subtitle={`${metrics.openDealsCount} open deal${metrics.openDealsCount === 1 ? '' : 's'}`}
            />
            <MetricCard
              title="Messages Sent Today"
              value={metrics.messagesSentToday.current.toLocaleString()}
              icon={Send}
              delta={{
                sign: metrics.messagesSentToday.current - metrics.messagesSentToday.previous,
                label: deltaLabel(
                  metrics.messagesSentToday.current - metrics.messagesSentToday.previous,
                  'vs yesterday',
                ),
              }}
            />
          </>
        )}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <ConversationsChart
            series={series}
            loading={seriesLoading}
            range={range}
            onRangeChange={handleRangeChange}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <PipelineDonut data={pipeline} loading={pipelineLoading} currency={defaultCurrency} />
            <ResponseTimeChart data={responseTime} loading={responseTimeLoading} />
          </div>
        </div>
        <div>
          <ActivityFeed items={activity} loading={activityLoading} />
        </div>
      </div>
    </div>
  )
}

function deltaLabel(delta: number, suffix: string): string {
  if (delta > 0) return `+${delta} ${suffix}`
  if (delta < 0) return `${delta} ${suffix}`
  return `0 ${suffix}`
}
