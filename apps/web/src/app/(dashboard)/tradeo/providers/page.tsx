'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TRADEO_CATEGORIES } from '@/lib/tradeo/categories'
import { Users, Plus, X, Search, Phone, MapPin, Tag, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react'

interface Provider {
  id: string
  business_name: string
  phone_number: string
  pincode: string
  category: string
  services: string[]
  is_active: boolean
  created_at: string
  quotes: { id: string }[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Beverages': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Home Services': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Transportation': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Education': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Healthcare': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Beauty & Wellness': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Cleaning': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Events': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Retail & Shopping': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Other': 'bg-muted text-muted-foreground border-border',
}

function ProviderForm({ onSave, onClose, defaultPincode }: { onSave: () => void; onClose: () => void; defaultPincode?: string }) {
  const [form, setForm] = useState({
    business_name: '', phone_number: '', pincode: defaultPincode || '', category: 'Food & Beverages', services: [] as string[]
  })
  const [serviceInput, setServiceInput] = useState('')
  const [saving, setSaving] = useState(false)

  function addService() {
    const s = serviceInput.trim()
    if (s && !form.services.includes(s)) {
      setForm(f => ({ ...f, services: [...f.services, s] }))
      setServiceInput('')
    }
  }

  async function handleSave() {
    if (!form.phone_number || !form.pincode || !form.category) return
    setSaving(true)
    // Normalize phone to include 91 prefix
    let phone = form.phone_number.replace(/\D/g, '')
    if (phone.length === 10) phone = '91' + phone

    await fetch('/api/tradeo/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, phone_number: phone })
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-lg">Add Provider</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Business Name</label>
            <input
              value={form.business_name}
              onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
              placeholder="e.g. Raja's Hotel"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">WhatsApp Phone *</label>
              <input
                value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                placeholder="9486335870"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pincode *</label>
              <input
                value={form.pincode}
                onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                placeholder="606703"
                maxLength={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {TRADEO_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Services / Keywords</label>
            <div className="flex gap-2">
              <input
                value={serviceInput}
                onChange={e => setServiceInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addService()}
                placeholder="e.g. Biriyani (press Enter)"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button onClick={addService} className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80">
                Add
              </button>
            </div>
            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.services.map(s => (
                  <span key={s} className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground">
                    {s}
                    <button onClick={() => setForm(f => ({ ...f, services: f.services.filter(x => x !== s) }))} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.phone_number || !form.pincode}
            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Add Provider'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProvidersPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterPincode, setFilterPincode] = useState('')

  async function load() {
    const params = new URLSearchParams()
    if (filterPincode) params.set('pincode', filterPincode)
    if (filterCat !== 'All') params.set('category', filterCat)
    const res = await fetch(`/api/tradeo/providers?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProviders(data.providers || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [filterCat, filterPincode])

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/tradeo/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current })
    })
    load()
  }

  const filtered = providers.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.business_name?.toLowerCase().includes(s) ||
      p.phone_number?.includes(s) ||
      (p.services || []).some(sv => sv.toLowerCase().includes(s))
    )
  })

  return (
    <div className="space-y-6">
      {showForm && (
        <ProviderForm
          onSave={() => { setShowForm(false); load() }}
          onClose={() => setShowForm(false)}
          defaultPincode={profile?.pincode || ''}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/tradeo')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" /> Provider Network
            </h1>
            <p className="text-sm text-muted-foreground">{providers.length} registered providers</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, service..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <input
            value={filterPincode}
            onChange={e => setFilterPincode(e.target.value)}
            placeholder="Filter pincode"
            maxLength={6}
            className="w-36 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['All', ...TRADEO_CATEGORIES.map(c => c.value)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filterCat === cat
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'border border-border bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {TRADEO_CATEGORIES.find(c => c.value === cat)?.label || '🌐 All'}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-foreground">No providers found</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first provider to get started!</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add First Provider
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => {
            const colorClass = CATEGORY_COLORS[p.category] || CATEGORY_COLORS['Other']
            const initial = p.business_name?.charAt(0)?.toUpperCase() || '?'

            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${p.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{p.business_name || 'Unnamed'}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(p.id, p.is_active)}
                    className={`text-muted-foreground hover:text-foreground transition-colors`}
                    title={p.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {p.is_active
                      ? <ToggleRight className="h-5 w-5 text-emerald-400" />
                      : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    }
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    +{p.phone_number}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {p.pincode}
                  </p>
                  {p.services?.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <Tag className="h-3 w-3 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {p.services.map(s => (
                          <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {p.quotes?.length || 0} total quotes
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${p.is_active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
