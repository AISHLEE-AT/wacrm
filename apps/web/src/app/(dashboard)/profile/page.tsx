// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo, Suspense, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

// Lucide icons
import {
  UserCircle, LogOut, CheckCircle,
  Smartphone, MapPin,
  LayoutGrid, User, Shield, Palette, PlugZap, Tags, Coins,
  UsersRound, KeyRound, Sparkles,
  CreditCard, QrCode, FileText, Clock, ExternalLink, MessageCircle, Truck,
  Heart, Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// CRM Settings panels
import { SettingsOverview } from '@/components/settings/settings-overview';
import { ProfileForm } from '@/components/settings/profile-form';
import { SecurityPanel } from '@/components/settings/security-panel';
import { AppearancePanel } from '@/components/settings/appearance-panel';
import { WhatsAppConfig } from '@/components/settings/whatsapp-config';
import { TemplateManager } from '@/components/settings/template-manager';
import { FieldsAndTagsPanel } from '@/components/settings/fields-and-tags-panel';
import { DealsSettings } from '@/components/settings/deals-settings';
import { MembersTab } from '@/components/settings/members-tab';
import { ApiKeysSettings } from '@/components/settings/api-keys-settings';

// ───── Tab configuration ─────
const PERSONAL_TABS = [
  { id: 'account', icon: UserCircle, label: 'Profile & Account', group: 'personal' },
  { id: 'digital_id', icon: QrCode, label: 'Digital ID', group: 'personal' },
] as const;

const CRM_TABS = [
  { id: 'crm_overview', icon: LayoutGrid, label: 'Overview', group: 'workspace', adminOnly: true },
  { id: 'crm_profile', icon: User, label: 'CRM Profile', group: 'workspace', adminOnly: true },
  { id: 'crm_security', icon: Shield, label: 'Login & Security', group: 'workspace' },
  { id: 'crm_appearance', icon: Palette, label: 'Appearance', group: 'workspace' },
  { id: 'crm_whatsapp', icon: PlugZap, label: 'WhatsApp', group: 'workspace', adminOnly: true },
  { id: 'crm_templates', icon: FileText, label: 'Templates', group: 'workspace', adminOnly: true },
  { id: 'crm_fields', icon: Tags, label: 'Fields & Tags', group: 'workspace', adminOnly: true },
  { id: 'crm_members', icon: UsersRound, label: 'Team Members', group: 'workspace', adminOnly: true },
  { id: 'crm_api', icon: KeyRound, label: 'API Keys', group: 'workspace', adminOnly: true },
] as const;

// ───── Legacy tab resolver (handles old /settings?tab=xxx links) ─────
function resolveTab(raw: string | null): string {
  if (!raw) return 'account';
  const validTabs = [
    'account', 'digital_id',
    'crm_overview', 'crm_profile', 'crm_security', 'crm_appearance',
    'crm_whatsapp', 'crm_templates', 'crm_fields', 'crm_members', 'crm_api'
  ];
  if (validTabs.includes(raw)) return raw;
  const legacyMap: Record<string, string> = {
    overview: 'crm_overview',
    profile: 'crm_profile',
    security: 'crm_security',
    appearance: 'crm_appearance',
    whatsapp: 'crm_whatsapp',
    templates: 'crm_templates',
    fields: 'crm_fields',
    deals: 'crm_fields',
    members: 'crm_members',
    api: 'crm_api',
    tags: 'crm_fields',
    'custom-fields': 'crm_fields',
    account: 'account',
    digital_id: 'digital_id',
  };
  return legacyMap[raw] || 'account';
}

class ProfileErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ProfileErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[450px] w-full flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-2xl bg-destructive/10 p-4 text-destructive border border-destructive/20 max-w-md">
            <h2 className="text-lg font-bold">Profile Page Encountered an Issue</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred while rendering your profile.'}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md"
          >
            🔄 Reload Profile & Settings
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UnifiedProfilePage() {
  return (
    <ProfileErrorBoundary>
      <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
        <ProfilePageInner />
      </Suspense>
    </ProfileErrorBoundary>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, accountRole, signOut, loading } = useAuth();
  const { mode } = useTheme();

  const activeTab = resolveTab(searchParams ? searchParams.get('tab') : null);
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  const [dbProfile, setDbProfile] = useState<any>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState('');
  const [upiIdState, setUpiIdState] = useState('');
  const [driverProfile, setDriverProfile] = useState<any>(null);

  const activeProfile = dbProfile || profile;

  // STRICT ADMIN CHECK: Only 9486335870 or aishleetechnology@gmail.com is Administrator
  const isAdmin = Boolean(
    activeProfile?.email?.includes("aishleetechnology@gmail.com") ||
    activeProfile?.email?.includes("9486335870") ||
    activeProfile?.phone?.includes("9486335870") ||
    user?.email?.includes("aishleetechnology@gmail.com") ||
    user?.email?.includes("9486335870") ||
    user?.phone?.includes("9486335870")
  );

  useEffect(() => {
    if (!user?.id) return;
    const fetchDbProfile = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .maybeSingle();
        if (data) {
          setDbProfile(data);
          if (data.upi_id) setUpiIdState(data.upi_id);
        }
      } catch (err) {
        console.error('Error fetching db profile:', err);
      }
    };
    fetchDbProfile();
  }, [user?.id]);

  const handleSaveName = async () => {
    if (!nameValue.trim() || !user?.id) return;
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('profiles').update({ full_name: nameValue.trim() }).eq('id', user.id);
      await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } });
      setEditingName(false);
      window.location.reload();
    } catch (err) {
      console.error('Error saving name:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchDriverData = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setDriverProfile(data);
    };
    fetchDriverData();
  }, [user?.id]);

  const formatCleanPhone = (raw?: string) => {
    if (!raw) return '';
    let clean = raw;
    if (clean.includes('@')) clean = clean.split('@')[0];
    clean = clean.replace(/\D/g, '');
    if (clean.startsWith('91') && clean.length === 12) clean = clean.substring(2);
    if (clean.length === 10) return `+91 ${clean.substring(0, 5)} ${clean.substring(5)}`;
    return raw;
  };

  const displayPhone = formatCleanPhone(activeProfile?.phone || activeProfile?.email || user?.phone || user?.email);

  if (loading && !user) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading Profile & Settings...</p>
        </div>
      </div>
    );
  }

  const goSettings = (section: string) => {
    setActiveTab(`crm_${section}`);
  };

  const availableCrmTabs = CRM_TABS.filter(t => !t.adminOnly || isAdmin);

  const getAdminVerificationWhatsAppUrl = () => {
    const name = activeProfile?.full_name || 'Driver Partner';
    const vehicle = driverProfile?.vehicle_number || driverProfile?.vehicle_registration || 'Vehicle';
    const text = `Hello Admin! I have registered as a DriveO Driver Partner (Name: ${name}, Vehicle: ${vehicle}). Please verify my driver account.`;
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '916381029380';
    return `https://api.whatsapp.com/send?phone=${supportPhone}&text=${encodeURIComponent(text)}`;
  };

  const renderAccount = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-6">
        {activeProfile?.avatar_url ? (
          <img
            src={activeProfile.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl border-2 border-border object-cover shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl border-2 border-border bg-primary/10 flex items-center justify-center shadow-lg">
            <UserCircle size={40} className="text-primary" />
          </div>
        )}
        <div>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Your Full Name"
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition px-2 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">
                {activeProfile?.full_name || 'User'}
              </h2>
              <button
                onClick={() => { setNameValue(activeProfile?.full_name || ''); setEditingName(true); }}
                className="text-xs text-muted-foreground hover:text-primary font-medium transition px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 flex items-center gap-1 border border-border/50"
              >
                ✏️ Edit Name
              </button>
            </div>
          )}
          <p className="text-primary text-sm font-medium mt-0.5 uppercase tracking-wider">
            {isAdmin ? 'Admin / Owner' : 'User'}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-2 rounded-xl bg-primary/10">
            <Smartphone className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WhatsApp Phone</p>
            <p className="font-medium">{displayPhone}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-2 rounded-xl bg-primary/10">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
            <p className="font-medium">{profile?.location || 'Tamil Nadu, India'}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <CreditCard className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">UPI ID (For Driver/Ride Settlements)</p>
              {editingUpi ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={upiValue}
                    onChange={e => setUpiValue(e.target.value)}
                    placeholder="e.g. 9876543210@upi"
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  />
                  <button
                    onClick={async () => {
                      if (!upiValue.trim() || !user?.id) return;
                      try {
                        const { createClient } = await import('@/lib/supabase/client');
                        const supabase = createClient();
                        const cleanUpi = upiValue.trim();
                        await supabase
                          .from('profiles')
                          .update({ upi_id: cleanUpi })
                          .or(`id.eq.${user.id},user_id.eq.${user.id}`);
                        setUpiIdState(cleanUpi);
                        setEditingUpi(false);
                        alert('✅ UPI ID saved successfully!');
                      } catch (err) {
                        console.error('Error saving UPI ID:', err);
                        alert('Failed to save UPI ID. Please try again.');
                      }
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition"
                  >Save</button>
                  <button onClick={() => setEditingUpi(false)} className="text-muted-foreground text-sm hover:text-foreground transition">Cancel</button>
                </div>
              ) : (
                <p className="font-medium">{upiIdState || (profile as any)?.upi_id || 'Not provided'}</p>
              )}
            </div>
          </div>
          {!editingUpi && (
            <button
              onClick={() => { setUpiValue(upiIdState || (profile as any)?.upi_id || ''); setEditingUpi(true); }}
              className="text-xs text-primary hover:underline font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {/* Merchant & Driver UPI QR Code Card */}
        <hr className="border-border" />
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              வணிகர் & ஓட்டுநர் UPI QR குறியீடு (Merchant & Driver QR)
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified P2P Pay
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Direct 0-commission instant payment QR code generated from your verified UPI ID: <strong>{upiIdState || (profile as any)?.upi_id || `${displayPhone.replace(/\D/g, '')}@upi`}</strong>
          </p>
          <div className="flex items-center gap-4 pt-1">
            <div className="p-3 bg-white rounded-xl shadow-md shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(upiIdState || (profile as any)?.upi_id || `${displayPhone.replace(/\D/g, '')}@upi`)}&pn=${encodeURIComponent(profile?.full_name || 'FAGO Partner')}`}
                alt="UPI QR Code"
                className="w-24 h-24 object-contain"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">📲 Instant Scan & Pay</span>
              <p className="text-[11px] text-muted-foreground">Customers can scan this QR code using PhonePe, Google Pay, or Paytm for direct 0% commission payment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Registration & Verification Status Card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-500" /> DriveO Partner Registration Status
        </h3>

        {!driverProfile ? (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">You are not registered as a DriveO vehicle operator yet.</p>
            <button
              onClick={() => router.push('/drivo')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shrink-0"
            >
              Enroll as Driver Partner
            </button>
          </div>
        ) : !driverProfile.is_verified ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Admin Verification
              </span>
              <span className="text-xs text-muted-foreground font-mono">Reg: {driverProfile.vehicle_number || driverProfile.vehicle_registration}</span>
            </div>
            <p className="text-xs text-muted-foreground">Your driver profile is undergoing document verification by Admin. Tap below to request quick verification via WhatsApp.</p>
            <a
              href={getAdminVerificationWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> Request Admin Verification via WhatsApp
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Verified & Active Driver Partner
            </span>
            <button
              onClick={() => router.push('/drivo')}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs transition shrink-0"
            >
              Open DriveO Portal
            </button>
          </div>
        )}
      </div>

      {/* Support & Contribute to FAGO Card */}
      <div className="bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-cyan-500/10 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Support FAGO Good Cause <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">Community Support</span>
              </h3>
              <p className="text-xs text-muted-foreground">Empowering Farmers, Drivers, Tutors & Local Buyers with 0% Commission</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          FAGO is a community-first ecosystem designed to serve Tamil Nadu and India with zero middleman fees. Contribute ₹10, ₹50, ₹100 or more to directly support platform upkeep & local community development.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/60 border border-border/80 rounded-xl p-3">
          <div className="flex items-center gap-2 flex-1 w-full">
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">Official UPI ID</span>
            <span className="text-sm font-mono font-bold text-foreground tracking-wide">9486335870@hdfcbank</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText("9486335870@hdfcbank");
              alert("UPI ID copied to clipboard: 9486335870@hdfcbank");
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copy UPI ID
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="upi://pay?pa=9486335870@hdfcbank&pn=Aishlee%20Technology&tn=FAGO%20Good%20Cause%20Contribution&cu=INR"
            className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
          >
            <Heart className="w-4 h-4" /> Contribute via UPI (₹10 / ₹100+)
          </a>
        </div>
      </div>

      <button
        onClick={() => {
          signOut?.();
          router.push('/login');
        }}
        className="w-full py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );

  const renderDigitalId = () => {
    const idHash = (profile as any)?.digital_id_hash || `FAGO-TN-${displayPhone.replace(/\D/g, '') || user?.id || '9486335870'}`;
    const qrData = `https://watscrm.vercel.app/profile?id=${idHash}`;

    return (
      <div className="flex justify-center items-center py-6">
        <div className="bg-gradient-to-br from-card via-background to-card border-2 border-primary/40 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] relative overflow-hidden space-y-6">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="text-primary font-bold text-xl tracking-wider block">FAGO DIGITAL ID</span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Official Tamil Nadu Pass</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={14} /> VERIFIED
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl flex justify-center shadow-inner relative z-10 border border-border">
            <QRCodeSVG value={qrData} size={190} />
          </div>

          <div className="text-center relative z-10 space-y-2">
            <h3 className="text-foreground text-xl font-bold tracking-wider">
              {(profile?.full_name || 'FAGO User')?.toUpperCase()}
            </h3>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              {isAdmin ? '👑 ADMIN / REGIONAL DIRECTOR' : (accountRole || 'USER')?.toUpperCase()}
            </p>
            <p className="text-muted-foreground text-xs font-mono">
              📱 {displayPhone}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(idHash);
                  alert(`✅ Digital ID copied: ${idHash}`);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 transition flex items-center justify-center gap-1.5 w-full"
              >
                <Copy size={14} /> Copy ID: {idHash}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCrmContent = () => {
    switch (activeTab) {
      case 'crm_overview':
        return <SettingsOverview onSelect={goSettings} />;
      case 'crm_profile':
        return <ProfileForm />;
      case 'crm_security':
        return <SecurityPanel />;
      case 'crm_appearance':
        return <AppearancePanel />;
      case 'crm_whatsapp':
        return <WhatsAppConfig />;
      case 'crm_templates':
        return <TemplateManager />;
      case 'crm_fields':
        return <FieldsAndTagsPanel />;
      case 'crm_deals':
        return <DealsSettings />;
      case 'crm_members':
        return <MembersTab />;
      case 'crm_api':
        return <ApiKeysSettings />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (activeTab === 'account') return renderAccount();
    if (activeTab === 'digital_id') return renderDigitalId();
    if (activeTab.startsWith('crm_')) return renderCrmContent();
    return renderAccount();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal account, digital identity, and workspace configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label="Profile sections"
          className="flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border lg:sticky lg:top-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
        >
          <div className="flex shrink-0 gap-1 lg:flex-col lg:gap-0.5">
            <div className="hidden px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase lg:block">
              Personal
            </div>
            {PERSONAL_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors lg:w-full ${
                    isActive
                      ? 'bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.15)]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 gap-1 lg:flex-col lg:gap-0.5">
            <div className="hidden px-3 pt-3.5 pb-1.5 text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase lg:block">
              Workspace
            </div>
            {availableCrmTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors lg:w-full ${
                    isActive
                      ? 'bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.15)]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
