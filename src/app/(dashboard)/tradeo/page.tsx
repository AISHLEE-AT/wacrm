'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TRADEO_CATEGORIES, detectCategory } from '@/lib/tradeo/categories'
import { translateTamilToEnglish, isTamil } from '@/lib/tradeo/tamil-translate'
import { Mic, MicOff, Search, Zap, ChevronRight, Clock, CheckCircle2, Package, Users, TrendingUp, AlertCircle, Languages } from 'lucide-react'

// Web Speech API type (not in TS default lib)
type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T
  : typeof window extends { webkitSpeechRecognition: infer T } ? T : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any

interface Provider {
  id: string
  business_name: string
  phone_number: string
  pincode: string
  category: string
  services: string[]
}

interface RequestItem {
  id: string
  item_requested: string
  pincode: string
  category: string
  status: string
  created_at: string
  auto_select_at: string | null
  quotes: { id: string; price: number; status: string }[]
}

// Fuse.js-style scoring for provider matching (no dependency needed)
function scoreProviderMatch(provider: Provider, keyword: string): number {
  const kw = keyword.toLowerCase()
  let score = 0
  if (provider.business_name?.toLowerCase().includes(kw)) score += 3
  if (provider.category?.toLowerCase().includes(kw)) score += 2
  if ((provider.services || []).some(s => s.toLowerCase().includes(kw))) score += 5
  return score
}

export default function TradeoPage() {
  const { user, profile } = useAuth()
  const router = useRouter()

  // Search state
  const [keyword, setKeyword] = useState('')        // English search term (used for API)
  const [tamilOriginal, setTamilOriginal] = useState('')  // Original Tamil speech (display only)
  const [pincode, setPincode] = useState('')
  const [category, setCategory] = useState('All')
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceLang, setVoiceLang] = useState<'ta-IN' | 'en-IN'>('ta-IN') // Default Tamil
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // Auto-fill pincode from profile
  useEffect(() => {
    if (profile?.pincode && !pincode) {
      setPincode(profile.pincode)
    }
  }, [profile])

  // Results
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)

  // Recent requests
  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([])
  const [broadcasting, setBroadcasting] = useState(false)

  // Stats
  const [stats, setStats] = useState({ providers: 0, requests: 0, quotesToday: 0, closed: 0 })

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setVoiceSupported(true)
    }
    loadRecentRequests()
    loadStats()
  }, [])

  async function loadRecentRequests() {
    const res = await fetch('/api/tradeo/requests')
    if (res.ok) {
      const data = await res.json()
      setRecentRequests(data.requests || [])
    }
  }

  async function loadStats() {
    const [provRes, reqRes] = await Promise.all([
      fetch('/api/tradeo/providers'),
      fetch('/api/tradeo/requests')
    ])
    const provData = provRes.ok ? await provRes.json() : { providers: [] }
    const reqData = reqRes.ok ? await reqRes.json() : { requests: [] }
    const requests: RequestItem[] = reqData.requests || []
    const today = new Date().toDateString()
    const quotesToday = requests.filter(r => new Date(r.created_at).toDateString() === today)
      .reduce((acc, r) => acc + (r.quotes?.length || 0), 0)
    const closed = requests.filter(r => r.status === 'closed').length
    setStats({
      providers: provData.providers?.length || 0,
      requests: requests.length,
      quotesToday,
      closed
    })
  }

  function startVoiceSearch() {
    const win = window as any
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = voiceLang        // 'ta-IN' or 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('')

      if (isTamil(transcript)) {
        // Tamil speech detected — translate to English for search
        const english = translateTamilToEnglish(transcript)
        setTamilOriginal(transcript)       // show original Tamil
        setKeyword(english)                // use English for API search
        const cat = detectCategory(english)
        if (cat !== 'Other') setCategory(cat)
      } else {
        // English / Tanglish — use directly
        setTamilOriginal('')
        setKeyword(transcript)
        const cat = detectCategory(transcript)
        if (cat !== 'Other') setCategory(cat)
      }
    }

    recognition.onend = () => { setIsListening(false) }
    recognition.onerror = () => { setIsListening(false) }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function stopVoiceSearch() {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  async function handleSearch() {
    if (!keyword.trim() || !pincode.trim()) return
    setSearching(true)
    setSearched(true)
    setSelectedIds(new Set())

    const res = await fetch('/api/tradeo/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: keyword.trim(), pincode: pincode.trim(), category })
    })

    if (res.ok) {
      const data = await res.json()
      // Sort by relevance score
      const scored = (data.providers || []).sort(
        (a: Provider, b: Provider) => scoreProviderMatch(b, keyword) - scoreProviderMatch(a, keyword)
      )
      setProviders(scored)
      // Auto-select all by default
      setSelectedIds(new Set(scored.map((p: Provider) => p.id)))
    }
    setSearching(false)
  }

  async function handleBroadcast() {
    if (selectedIds.size === 0 || !keyword.trim() || !pincode.trim()) return
    setBroadcasting(true)

    // 1. Create the request
    const reqRes = await fetch('/api/tradeo/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_requested: keyword.trim(),
        pincode: pincode.trim(),
        category,
        buyer_phone: '',
        buyer_user_id: user?.id
      })
    })

    if (!reqRes.ok) {
      setBroadcasting(false)
      return
    }

    const { request } = await reqRes.json()

    // 2. Broadcast
    const broadRes = await fetch('/api/tradeo/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: request.id,
        provider_ids: Array.from(selectedIds),
        item_requested: keyword.trim(),
        pincode: pincode.trim()
      })
    })

    setBroadcasting(false)

    if (broadRes.ok) {
      router.push(`/tradeo/requests/${request.id}`)
    }
  }

  const statusColor: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10',
    broadcasted: 'text-blue-400 bg-blue-400/10',
    closed: 'text-emerald-400 bg-emerald-400/10',
  }

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    broadcasted: <Zap className="h-3 w-3" />,
    closed: <CheckCircle2 className="h-3 w-3" />,
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Zap className="h-5 w-5" />
            </span>
            TradeO
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find the best provider, get quotes via WhatsApp
          </p>
        </div>
        <button
          onClick={() => router.push('/tradeo/providers')}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Users className="h-4 w-4" />
          Manage Providers
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Providers', value: stats.providers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Requests', value: stats.requests, icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Quotes Today', value: stats.quotesToday, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Deals Closed', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color} mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search Panel */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-4">
          🔍 What are you looking for?
        </h2>

        {/* Category Dropdown */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {[{ value: 'All', label: '🌐 All' }, ...TRADEO_CATEGORIES].map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  category === cat.value
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'border border-border bg-muted/50 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Row */}
        <div className="flex gap-3">
          {/* Voice + Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value)
                const cat = detectCategory(e.target.value)
                if (cat !== 'Other') setCategory(cat)
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={isListening ? (voiceLang === 'ta-IN' ? '🎤 பேசுங்கள்...' : '🎤 Listening...') : 'Search or speak (e.g. Biriyani, பிரியாணி...)'}
              className={`w-full rounded-xl border py-3 pl-10 pr-24 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                isListening
                  ? 'border-red-500/50 ring-2 ring-red-500/20 animate-pulse'
                  : 'border-border focus:border-emerald-500/50 focus:ring-emerald-500/20'
              }`}
            />
            {voiceSupported && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Language Toggle */}
                <button
                  onClick={() => setVoiceLang(voiceLang === 'ta-IN' ? 'en-IN' : 'ta-IN')}
                  title={voiceLang === 'ta-IN' ? 'Switch to English voice' : 'Switch to Tamil voice'}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                    voiceLang === 'ta-IN'
                      ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25'
                      : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
                  }`}
                >
                  <Languages className="h-3 w-3" />
                  {voiceLang === 'ta-IN' ? 'தமிழ்' : 'EN'}
                </button>
                {/* Mic Button */}
                <button
                  onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                  className={`rounded-lg p-1.5 transition-all ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Pincode — shown as editable chip if from profile, or plain input */}
          <div className="relative">
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Pincode"
              maxLength={6}
              className="w-32 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {profile?.pincode && pincode === profile.pincode && (
              <span className="absolute -top-2 left-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">profile</span>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!keyword.trim() || !pincode.trim() || searching}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {searching ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Find
          </button>
        </div>

        {/* Tamil Translation Display */}
        {tamilOriginal && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/15 text-orange-400 text-xs">த</span>
            <span className="text-sm text-orange-300 font-medium">{tamilOriginal}</span>
            <span className="text-muted-foreground text-xs">→</span>
            <span className="text-sm text-emerald-400 font-medium">{keyword}</span>
            <button
              onClick={() => { setTamilOriginal(''); setKeyword(''); }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searched && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              {providers.length > 0
                ? `✅ ${providers.length} provider${providers.length !== 1 ? 's' : ''} found for "${keyword}" in ${pincode}`
                : `❌ No providers found for "${keyword}" in ${pincode}`}
            </h2>
            {providers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIds(new Set(providers.map(p => p.id)))}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {providers.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No registered providers match your search in this pincode.
              </p>
              <button
                onClick={() => router.push('/tradeo/providers')}
                className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                + Add providers for this area →
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
                {providers.map(p => {
                  const selected = selectedIds.has(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        const next = new Set(selectedIds)
                        if (selected) next.delete(p.id)
                        else next.add(p.id)
                        setSelectedIds(next)
                      }}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-emerald-500/60 bg-emerald-500/8 ring-1 ring-emerald-500/30 shadow-sm shadow-emerald-500/10'
                          : 'border-border bg-card/50 hover:border-border/80 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          selected ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {p.business_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">{p.business_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.pincode}</p>
                          {p.services?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {p.services.slice(0, 3).map(s => (
                                <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? 'border-emerald-500 bg-emerald-500' : 'border-border'
                        }`}>
                          {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleBroadcast}
                disabled={selectedIds.size === 0 || broadcasting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {broadcasting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Broadcasting via WhatsApp...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Request Quotes from {selectedIds.size} Provider{selectedIds.size !== 1 ? 's' : ''} via WhatsApp
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Recent Requests */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">📋 Recent Requests</h2>
        {recentRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No requests yet. Search above to get started!</p>
        ) : (
          <div className="space-y-2">
            {recentRequests.slice(0, 8).map(req => (
              <button
                key={req.id}
                onClick={() => router.push(`/tradeo/requests/${req.id}`)}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card/50 p-3.5 text-left hover:bg-muted/30 hover:border-border/80 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground">{req.item_requested}</p>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[req.status] || 'text-muted-foreground bg-muted'}`}>
                      {statusIcon[req.status]}
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    📍 {req.pincode} · {req.quotes?.length || 0} quote{(req.quotes?.length || 0) !== 1 ? 's' : ''} · {new Date(req.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
