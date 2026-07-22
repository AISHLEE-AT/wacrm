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
  CreditCard, QrCode, FileText
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
  { id: 'crm_overview', icon: LayoutGrid, label: 'Overview', group: 'workspace' },
  { id: 'crm_profile', icon: User, label: 'CRM Profile', group: 'workspace' },
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
    account: 'account',
    digital_id: 'digital_id',
  };
  return legacyMap[raw] || 'account';
}

export default function UnifiedProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, accountRole, signOut } = useAuth();
  const { mode } = useTheme();

  const activeTab = resolveTab(searchParams.get('tab'));
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  // STRICT ADMIN CHECK: ONLY 9486335870 or aishleetechnology@gmail.com
  const isAdmin = Boolean(
    profile?.email === "aishleetechnology@gmail.com" ||
    profile?.phone?.includes("9486335870") ||
    user?.email === "aishleetechnology@gmail.com" ||
    user?.phone?.includes("9486335870")
  );
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState('');

  const goSettings = (section: string) => {
    setActiveTab(`crm_${section}`);
  };

  const availableCrmTabs = CRM_TABS.filter(t => !t.adminOnly || isAdmin);

  const renderAccount = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-6">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
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
            {profile?.full_name || 'User'}
          </h2>
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
            <p className="font-medium">{profile?.phone || 'Not provided'}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-2 rounded-xl bg-primary/10">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
            <p className="font-medium">{profile?.location || 'Not provided'}</p>
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
                      if (upiValue.trim()) {
                        const { createClient } = await import('@/lib/supabase/client');
                        const supabase = createClient();
                        await supabase.from('profiles').update({ upi_id: upiValue.trim() }).eq('id', user?.id);
                        setEditingUpi(false);
                      }
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition"
                  >Save</button>
                  <button onClick={() => setEditingUpi(false)} className="text-muted-foreground text-sm hover:text-foreground transition">Cancel</button>
                </div>
              ) : (
                <p className="font-medium">{(profile as any)?.upi_id || 'Not provided'}</p>
              )}
            </div>
          </div>
          {!editingUpi && (
            <button
              onClick={() => { setUpiValue((profile as any)?.upi_id || ''); setEditingUpi(true); }}
              className="text-xs text-muted-foreground hover:text-primary font-medium transition px-3 py-1 rounded-lg hover:bg-primary/10"
            >Edit</button>
          )}
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
    const qrData = (profile as any)?.digital_id_hash || `fago-id-${user?.id || 'guest'}`;

    return (
      <div className="flex justify-center items-center py-8">
        <div className="bg-gradient-to-br from-card to-background border-2 border-primary/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.15)] relative overflow-hidden">
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
              {(profile?.full_name || 'USER')?.toUpperCase()}
            </h3>
            <p className="text-muted-foreground text-sm tracking-widest mt-1 uppercase">
              {(accountRole || 'User')?.toUpperCase()}
            </p>
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
