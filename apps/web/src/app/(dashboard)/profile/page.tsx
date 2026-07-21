// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo, Suspense, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppProvider, useApp } from '@/aishlee/context/AppProvider';
import { profileSyncService } from '@/aishlee/services/profileSyncService';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

// Lucide icons
import {
  UserCircle, BadgeIcon, FileText, History, LogOut, CheckCircle,
  Smartphone, MapPin, Share2, Download,
  LayoutGrid, User, Shield, Palette, PlugZap, Tags, Coins,
  UsersRound, KeyRound, Settings, ChevronRight, Sparkles,
  CreditCard, QrCode, Briefcase, Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// CRM Settings panels (existing components)
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
  { id: 'resume', icon: Briefcase, label: 'Resume', group: 'personal' },
  { id: 'history', icon: Clock, label: 'History', group: 'personal' },
] as const;

const CRM_TABS = [
  { id: 'crm_overview', icon: LayoutGrid, label: 'Overview', group: 'workspace' },
  { id: 'crm_profile', icon: User, label: 'CRM Profile', group: 'workspace' },
  { id: 'crm_security', icon: Shield, label: 'Login & Security', group: 'workspace' },
  { id: 'crm_appearance', icon: Palette, label: 'Appearance', group: 'workspace' },
  { id: 'crm_whatsapp', icon: PlugZap, label: 'WhatsApp', group: 'workspace', adminOnly: true },
  { id: 'crm_templates', icon: FileText, label: 'Templates', group: 'workspace', adminOnly: true },
  { id: 'crm_fields', icon: Tags, label: 'Fields & Tags', group: 'workspace', adminOnly: true },
  { id: 'crm_deals', icon: Coins, label: 'Deals & Currency', group: 'workspace', adminOnly: true },
  { id: 'crm_members', icon: UsersRound, label: 'Team Members', group: 'workspace', adminOnly: true },
  { id: 'crm_api', icon: KeyRound, label: 'API Keys', group: 'workspace', adminOnly: true },
] as const;

// ───── Legacy tab resolver (handles old /settings?tab=xxx links) ─────
function resolveTab(raw: string | null): string {
  if (!raw) return 'account';
  // Map old settings tabs to CRM tabs
  const legacyMap: Record<string, string> = {
    overview: 'crm_overview',
    profile: 'crm_profile',
    security: 'crm_security',
    appearance: 'crm_appearance',
    whatsapp: 'crm_whatsapp',
    templates: 'crm_templates',
    fields: 'crm_fields',
    deals: 'crm_deals',
    members: 'crm_members',
    api: 'crm_api',
    tags: 'crm_fields',
    'custom-fields': 'crm_fields',
    // New direct tabs
    account: 'account',
    digital_id: 'digital_id',
    resume: 'resume',
    history: 'history',
  };
  return legacyMap[raw] || 'account';
}

// ───── Main Page (wrapped in Suspense for searchParams) ─────
export default function UnifiedProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <AppProvider>
        <ProfilePageInner />
      </AppProvider>
    </Suspense>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, logout, updateProfile } = useApp();
  const { user, profile, accountRole, signOut, defaultCurrency } = useAuth();
  const { mode } = useTheme();

  // Determine active tab from URL
  const activeTab = resolveTab(searchParams.get('tab'));
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  // Admin check for CRM tabs
  const isAdmin = accountRole === 'admin' || accountRole === 'owner';

  // Aishlee-side state
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadHistory();
    }
  }, [currentUser]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [txs, ords] = await Promise.all([
        profileSyncService.getTransactions(currentUser.id),
        profileSyncService.getOrders(currentUser.id)
      ]);
      setTransactions(txs);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // CRM settings navigation callback
  const goSettings = (section: string) => {
    setActiveTab(`crm_${section}`);
  };

  // All available tabs (filter admin-only CRM tabs for non-admins)
  const availableCrmTabs = CRM_TABS.filter(t => !t.adminOnly || isAdmin);

  // ───── Tab content renderers ─────

  const renderAccount = () => (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar & name */}
      <div className="flex items-center gap-6">
        {currentUser?.avatar_url || profile?.avatar_url ? (
          <img
            src={currentUser?.avatar_url || profile?.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl border-2 border-border object-cover shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl border-2 border-border bg-primary/10 flex items-center justify-center shadow-lg">
            <UserCircle size={40} className="text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {currentUser?.fullName || profile?.full_name || 'User'}
          </h2>
          <p className="text-primary text-sm font-medium mt-0.5">
            {currentUser?.role || accountRole || 'User'}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-2 rounded-xl bg-primary/10">
            <Smartphone className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WhatsApp</p>
            <p className="font-medium">{currentUser?.whatsapp || profile?.phone || 'Not provided'}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-2 rounded-xl bg-primary/10">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
            <p className="font-medium">{currentUser?.location || 'Not provided'}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <CreditCard className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">UPI ID</p>
              {editingUpi ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={upiValue}
                    onChange={e => setUpiValue(e.target.value)}
                    placeholder="e.g. name@bank"
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  />
                  <button
                    onClick={async () => {
                      if (upiValue.trim()) {
                        await profileSyncService.updateProfile(currentUser.id, { upi_id: upiValue.trim() });
                        updateProfile({ upi_id: upiValue.trim() });
                        setEditingUpi(false);
                      }
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition"
                  >Save</button>
                  <button onClick={() => setEditingUpi(false)} className="text-muted-foreground text-sm hover:text-foreground transition">Cancel</button>
                </div>
              ) : (
                <p className="font-medium">{currentUser?.upi_id || 'Not provided'}</p>
              )}
            </div>
          </div>
          {!editingUpi && (
            <button
              onClick={() => { setUpiValue(currentUser?.upi_id || ''); setEditingUpi(true); }}
              className="text-xs text-muted-foreground hover:text-primary font-medium transition px-3 py-1 rounded-lg hover:bg-primary/10"
            >Edit</button>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout?.();
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
    const qrData = currentUser?.digital_id_hash || `fago-id-${currentUser?.id || user?.id}`;

    return (
      <div className="flex justify-center items-center py-8">
        <div className="bg-gradient-to-br from-card to-background border-2 border-primary/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.15)] relative overflow-hidden">
          {/* Decorative sparkle */}
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles size={60} className="text-primary" />
          </div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <span className="text-primary font-bold text-lg tracking-wide">FAGO Digital ID</span>
            <CheckCircle className="text-primary" size={24} />
          </div>

          <div className="bg-white p-5 rounded-2xl flex justify-center mb-6 shadow-inner">
            <QRCodeSVG value={qrData} size={200} />
          </div>

          <div className="text-center relative z-10">
            <h3 className="text-foreground text-xl font-bold tracking-wider">
              {(currentUser?.fullName || profile?.full_name || 'USER')?.toUpperCase()}
            </h3>
            <p className="text-muted-foreground text-sm tracking-widest mt-1 uppercase">
              {(currentUser?.role || accountRole || 'User')?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderResume = () => {
    const skills: string[] = currentUser?.skills ? String(currentUser.skills).split(',').map((s: string) => s.trim()) : [];

    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">My Resume</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-card text-primary rounded-lg hover:bg-muted border border-border transition" title="Share URL">
              <Share2 size={20} />
            </button>
            <button className="p-2 bg-card text-destructive rounded-lg hover:bg-muted border border-border transition" title="Download PDF">
              <Download size={20} />
            </button>
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h3 className="text-primary font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm border border-primary/20 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-primary font-semibold mb-3">Education</h3>
          <p className="text-foreground bg-card p-4 rounded-xl border border-border">
            {currentUser?.education_level || 'No education data provided.'}
          </p>
        </div>

        {currentUser?.bio && (
          <div>
            <h3 className="text-primary font-semibold mb-3">Bio</h3>
            <p className="text-foreground bg-card p-4 rounded-xl border border-border">
              {currentUser.bio}
            </p>
          </div>
        )}

        {currentUser?.employment_status && (
          <div>
            <h3 className="text-primary font-semibold mb-3">Employment</h3>
            <p className="text-foreground bg-card p-4 rounded-xl border border-border">
              {currentUser.employment_status}
              {currentUser.experience_years ? ` • ${currentUser.experience_years} years experience` : ''}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="max-w-4xl">
      {loading ? (
        <div className="text-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      ) : transactions.length === 0 && orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <History size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No transactions yet</p>
          <p className="text-sm mt-1">Your transaction history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-primary font-bold text-lg mb-4">Transactions</h3>
          {transactions.map((tx: any) => (
            <div key={tx.id} className="bg-card border border-border rounded-xl p-4 flex justify-between items-center hover:border-primary/30 transition">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${tx.type === 'CREDIT' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-destructive/15 text-destructive'}`}>
                  {tx.type === 'CREDIT' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-foreground font-medium">{tx.description || 'Transaction'}</p>
                  <p className="text-xs text-muted-foreground">{tx.reference_module} • {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`font-bold text-lg ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-destructive'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // CRM Settings content — renders the actual existing CRM components
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

  // ───── Determine which content to render ─────
  const renderContent = () => {
    if (activeTab === 'account') return renderAccount();
    if (activeTab === 'digital_id') return renderDigitalId();
    if (activeTab === 'resume') return renderResume();
    if (activeTab === 'history') return renderHistory();
    if (activeTab.startsWith('crm_')) return renderCrmContent();
    return renderAccount();
  };

  // Active tab metadata
  const allTabs = [...PERSONAL_TABS, ...availableCrmTabs];
  const currentTab = allTabs.find(t => t.id === activeTab) || PERSONAL_TABS[0];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, digital identity, and workspace settings — all in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        {/* Left rail navigation */}
        <nav
          aria-label="Profile sections"
          className="flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border lg:sticky lg:top-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
        >
          {/* Personal section */}
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

          {/* Workspace / CRM section — only show if admin or has non-admin tabs */}
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

        {/* Main content area */}
        <div className="min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
