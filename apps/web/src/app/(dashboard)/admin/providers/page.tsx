'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, CheckCircle, XCircle, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';

interface Provider {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  role: string | null;
  profile_complete: boolean;
  created_at: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, location, role, profile_complete, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setProviders(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const filtered = providers.filter(p =>
    !search ||
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="flex h-full flex-col p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Service Providers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All registered users and service providers on the platform.
          </p>
        </div>
        <button
          onClick={fetchProviders}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: providers.length, color: 'text-foreground' },
          { label: 'Complete', value: providers.filter(p => p.profile_complete).length, color: 'text-emerald-500' },
          { label: 'Incomplete', value: providers.filter(p => !p.profile_complete).length, color: 'text-amber-500' },
          { label: 'Shown', value: filtered.length, color: 'text-primary' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
          Loading providers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No providers found</p>
          <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'No users registered yet.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Profile</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.full_name || <span className="text-muted-foreground italic">Unnamed</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground space-y-0.5">
                    {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{p.email}</div>}
                    {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{p.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.location ? (
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{p.location}</div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {p.role || 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.profile_complete ? (
                      <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Incomplete
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
