'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, Activity, Clock, CheckCircle2, ChevronRight, ShoppingBag, MapPin } from 'lucide-react'

// Uses public anon key for safe client fetching (RLS should ideally be applied)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RequestData {
  id: string
  item_requested: string
  pincode: string
  status: string
  created_at: string
  quotes: { id: string }[]
}

export default function RequestsListPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRequests() {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('id, item_requested, pincode, status, created_at, quotes(id)')
          .order('created_at', { ascending: false })

        if (error) throw error
        setRequests(data || [])
      } catch (err) {
        console.error('Failed to load requests:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
          <p className="text-muted-foreground mt-1">Browse all historical and active service requests.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
          <Briefcase className="h-4 w-4" />
          <span className="font-semibold">{requests.length} Total</span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <span className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg">No requests found</p>
            <button 
              onClick={() => router.push('/tradeo')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create New Request
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map((req) => {
              const isClosed = req.status === 'closed'
              const isPending = req.status === 'pending'
              
              return (
                <div 
                  key={req.id}
                  onClick={() => router.push(`/tradeo/requests/${req.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                        {req.item_requested}
                      </h3>
                      {isClosed ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Closed
                        </span>
                      ) : isPending ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <Activity className="h-3.5 w-3.5 animate-pulse" />
                          Live Broadcast
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Pincode {req.pincode}
                      </span>
                      <span>•</span>
                      <span>{req.quotes.length} quotes</span>
                      <span>•</span>
                      <span suppressHydrationWarning>
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center justify-end text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className="text-sm font-medium mr-2">View Board</span>
                    <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
