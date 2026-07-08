'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Trophy, Clock, Zap, CheckCircle2, TrendingDown, RefreshCw } from 'lucide-react'

interface Quote {
  id: string
  price: number
  status: string
  created_at: string
  provider_message: string | null
  provider_id: string
  providers: {
    id: string
    business_name: string
    phone_number: string
    category: string
  }
}

interface RequestDetail {
  id: string
  item_requested: string
  pincode: string
  category: string
  status: string
  created_at: string
  auto_select_at: string | null
  winner_provider_id: string | null
  quotes: Quote[]
}

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function CountdownTimer({ targetTime, onExpire }: { targetTime: string; onExpire: () => void }) {
  const [seconds, setSeconds] = useState(0)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const calc = () => {
      const remaining = Math.max(0, Math.floor((new Date(targetTime).getTime() - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0 && !expired) {
        setExpired(true)
        onExpire()
      }
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetTime, onExpire, expired])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const pct = Math.max(0, (seconds / 300) * 100)

  if (expired) return (
    <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium">
      <Zap className="h-3.5 w-3.5" /> Auto-selecting lowest quote now...
    </span>
  )

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle
            cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
            stroke="currentColor"
            strokeDasharray={`${pct} 100`}
            className={seconds < 60 ? 'text-red-400' : seconds < 120 ? 'text-amber-400' : 'text-emerald-400'}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
          seconds < 60 ? 'text-red-400' : seconds < 120 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Auto-select in</p>
        <p className="text-[10px] text-muted-foreground">lowest quote wins automatically</p>
      </div>
    </div>
  )
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [req, setReq] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [autoSelected, setAutoSelected] = useState(false)

  async function loadRequest() {
    const res = await fetch(`/api/tradeo/requests/${id}`)
    if (res.ok) {
      const data = await res.json()
      setReq(data.request)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRequest()

    // Supabase Realtime — quotes table changes for this request
    const channel = supabaseClient
      .channel(`quotes-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes', filter: `request_id=eq.${id}` },
        () => { loadRequest() }
      )
      .subscribe()

    return () => { supabaseClient.removeChannel(channel) }
  }, [id])

  async function selectWinner(quoteId: string) {
    setSelecting(quoteId)
    await fetch('/api/tradeo/select-winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: id, quote_id: quoteId })
    })
    await loadRequest()
    setSelecting(null)
  }

  async function handleAutoSelect() {
    if (autoSelected || !req) return
    const submitted = (req.quotes || []).filter(q => q.status === 'submitted')
    if (submitted.length === 0) return
    const lowest = submitted.sort((a, b) => a.price - b.price)[0]
    setAutoSelected(true)
    await selectWinner(lowest.id)
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )

  if (!req) return (
    <div className="text-center py-20 text-muted-foreground">Request not found</div>
  )

  // Separate submitted quotes (with prices) from pending (waiting for reply)
  const submittedQuotes = (req.quotes || []).filter(q => q.status === 'submitted' || q.status === 'won' || q.status === 'accepted')
  const pendingQuotes = (req.quotes || []).filter(q => q.status === 'pending')
  const sortedQuotes = [...submittedQuotes.sort((a, b) => a.price - b.price), ...pendingQuotes]
  const lowestPrice = submittedQuotes.length > 0 ? submittedQuotes.sort((a, b) => a.price - b.price)[0]?.price : null
  const isClosed = req.status === 'closed'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/tradeo')}
          className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{req.item_requested}</h1>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              isClosed ? 'bg-emerald-500/15 text-emerald-400' :
              req.status === 'broadcasted' ? 'bg-blue-500/15 text-blue-400' :
              'bg-amber-500/15 text-amber-400'
            }`}>
              {isClosed ? <CheckCircle2 className="h-3 w-3" /> : req.status === 'broadcasted' ? <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> : <Clock className="h-3 w-3" />}
              {isClosed ? 'Closed' : req.status === 'broadcasted' ? 'Live' : 'Pending'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            📍 {req.pincode} · {req.category} · {new Date(req.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={loadRequest}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Countdown Timer */}
      {req.auto_select_at && !isClosed && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <CountdownTimer targetTime={req.auto_select_at} onExpire={handleAutoSelect} />
          {sortedQuotes.length > 0 && !isClosed && (
            <button
              onClick={handleAutoSelect}
              className="flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/25 transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              Auto-pick Lowest (₹{lowestPrice})
            </button>
          )}
        </div>
      )}

      {/* Quote Leaderboard */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Live Quote Board
          </h2>
          <span className="text-sm text-muted-foreground">
            {submittedQuotes.length} quote{submittedQuotes.length !== 1 ? 's' : ''} received
            {pendingQuotes.length > 0 && ` · ${pendingQuotes.length} waiting`}
          </span>
        </div>

        {sortedQuotes.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Waiting for quotes...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Providers will reply via WhatsApp. Quotes appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedQuotes.map((quote, idx) => {
              const isWinner = quote.status === 'won' || quote.status === 'accepted' || req.winner_provider_id === quote.provider_id
              const isPending = quote.status === 'pending'
              const isLowest = !isPending && quote.price === lowestPrice && idx === 0 && !isClosed

              return (
                <div
                  key={quote.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-all ${
                    isWinner ? 'bg-emerald-500/8 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  {/* Rank */}
                  <span className="text-2xl w-8 text-center">
                    {isWinner ? '🏆' : MEDAL[idx] || `#${idx + 1}`}
                  </span>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">
                        {quote.providers?.business_name || 'Unknown Provider'}
                      </p>
                      {isLowest && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <TrendingDown className="h-2.5 w-2.5" /> Lowest
                        </span>
                      )}
                      {isWinner && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          ✓ Winner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{quote.providers?.category} · {new Date(quote.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    {quote.provider_message && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{quote.provider_message}"</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {isPending ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-3 w-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                        <span className="text-sm">Waiting...</span>
                      </div>
                    ) : (
                      <p className={`text-xl font-bold ${isWinner ? 'text-emerald-400' : isLowest ? 'text-emerald-400' : 'text-foreground'}`}>
                        ₹{quote.price.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Select Button */}
                  {!isClosed && !isPending && (
                    <button
                      onClick={() => selectWinner(quote.id)}
                      disabled={!!selecting}
                      className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                        isLowest
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600'
                          : 'border border-border bg-muted text-foreground hover:bg-muted/80'
                      } disabled:opacity-50`}
                    >
                      {selecting === quote.id ? (
                        <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                      ) : 'Select ✓'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Deal Closed Banner */}
      {isClosed && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
          <p className="font-bold text-emerald-400 text-lg">Deal Sealed! 🎉</p>
          <p className="text-sm text-muted-foreground mt-1">
            Winner has been notified via WhatsApp. All other providers received a thank-you message.
          </p>
        </div>
      )}
    </div>
  )
}
