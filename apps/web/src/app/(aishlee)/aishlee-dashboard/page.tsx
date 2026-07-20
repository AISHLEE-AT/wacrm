// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { 
  ShieldCheck, GraduationCap, IndianRupee, MapPin, 
  Store, Cpu, PlaySquare, ShieldAlert, Award, ChevronRight, 
  TrendingUp, Search, Landmark, ClipboardCheck, Map, ClipboardList, Users
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { dataService } from '@/aishlee/services/dataService';
import { supabase } from '@/aishlee/lib/supabaseClient';

// Widgets
import DailyContentBoard from '@/aishlee/components/dashboard/DailyContentBoard';
import RegionalNews from '@/aishlee/components/dashboard/RegionalNews';
import PollWidget from '@/aishlee/components/dashboard/PollWidget';
import AstroEdgeWidget from '@/aishlee/components/dashboard/AstroEdgeWidget';
import WeatherWidget from '@/aishlee/components/dashboard/WeatherWidget';
import ErrorBoundary from '@/aishlee/components/ErrorBoundary';

const Dashboard = () => {
  const { currentUser } = useApp();
  const router = useRouter();
const navigate = (path) => router.push(path);
  const [feeds, setFeeds] = useState({ news: null, poll: null, content: null });

  // Advanced Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      setShowSearchDropdown(true);
      timeoutId = setTimeout(async () => {
        try {
          const appRoutes = [
            { id: 'app1', title: 'TeachO (Courses)', type: 'App', path: '/teacho' },
            { id: 'app2', title: 'ToolsO (AI Tools)', type: 'Tool', path: '/toolso' },
            { id: 'app3', title: 'TradeO (Marketplace)', type: 'App', path: '/tradeo' },
            { id: 'app4', title: 'Careers & Jobs', type: 'App', path: '/careers' },
            { id: 'app5', title: 'MoneyO (Finance)', type: 'App', path: '/moneyo' },
            { id: 'app6', title: 'Profile Settings', type: 'App', path: '/profile' }
          ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

          const { data: courses } = await supabase
            .from('lms_courses')
            .select('id, title, class_level')
            .ilike('title', `%${searchQuery}%`)
            .limit(3);

          const { data: marketItems } = await supabase
            .from('unified_master_data')
            .select('id, title, item_type')
            .ilike('title', `%${searchQuery}%`)
            .limit(3);

          const dbResults = [
            ...(courses || []).map(c => ({ ...c, type: 'Course', path: '/teacho' })),
            ...(marketItems || []).map(m => ({ ...m, type: 'Market', path: '/tradeo' }))
          ];

          setSearchResults([...appRoutes, ...dbResults]);
        } catch (e) {
          console.error("Search failed:", e);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    async function loadFeeds() {
      try {
        const [poll, content] = await Promise.all([
          dataService.fetchPoll(),
          dataService.fetchDailyContent()
        ]);
        setFeeds({ poll, content });
      } catch (err: any) {
        console.error("Failed to load feeds", err);
      }
    }
    loadFeeds();
  }, []);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  const modules = [
    { id: 'teacho', icon: GraduationCap, label: 'TeachO', color: '#00E5FF', path: '/teacho', weight: currentUser?.main_category === 'Student' || currentUser?.main_category === 'Teacher' ? 10 : 0 },
    { id: 'testo', icon: ClipboardCheck, label: 'TestO', color: '#EF4444', path: '/testo', weight: currentUser?.main_category === 'Student' ? 9 : 0 },
    { id: 'toolso', icon: Cpu, label: 'ToolsO', color: '#10B981', path: '/toolso', weight: currentUser?.main_category === 'Farmer' || currentUser?.main_category === 'Professional' ? 8 : 1 },
    { id: 'tradeo', icon: Store, label: 'TradeO', color: '#F97316', path: '/tradeo', weight: currentUser?.main_category === 'Farmer' || currentUser?.main_category === 'Trader' ? 10 : 2 },
    { id: 'careers', icon: TrendingUp, label: 'Careers', color: '#8B5CF6', path: '/careers', weight: currentUser?.main_category === 'Professional' || currentUser?.main_category === 'Employee' || currentUser?.main_category === 'Employer' ? 10 : 3 },
    { id: 'moneyo', icon: Landmark, label: 'MoneyO', color: '#3B82F6', path: '/moneyo', weight: currentUser?.main_category === 'Financier' || currentUser?.main_category === 'Trader' ? 10 : 4 },
    { id: 'touro', icon: Map, label: 'TourO', color: '#14B8A6', path: '/touro', weight: 5 },
    { id: 'tasko', icon: ClipboardList, label: 'TaskO', color: '#8B5CF6', path: '/tasko', weight: currentUser?.main_category === 'Employee' || currentUser?.main_category === 'Professional' ? 10 : (currentUser?.main_category === 'Student' ? 9 : 0) },
  ];
  if (isAdmin) modules.push({ id: 'admino', icon: ShieldCheck, label: 'AdminO', color: '#FFD700', path: '/admino', weight: 100 });
  const sortedModules = modules.sort((a, b) => b.weight - a.weight);

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Header for Mobile only (Desktop uses Sidebar search) */}
      <div className="lg-hidden glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
          <div style={{ background: 'var(--surface-1)', padding: '12px', borderRadius: '12px 0 0 12px', display: 'flex', alignItems: 'center' }}>
            <Search color="var(--text-secondary)" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search ecosystem..." 
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.length >= 3) setShowSearchDropdown(true) }}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="input-field"
            style={{ borderRadius: '0 12px 12px 0', borderLeft: 'none' }} 
          />
          
          {showSearchDropdown && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 100, padding: '8px'
            }}>
              {isSearching ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div> : null}
              {!isSearching && searchResults.length > 0 && searchResults.map((res, i) => (
                <div key={i} onClick={() => navigate(res.path)} style={{ padding: '12px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{res.title}</span>
                  <span className="badge-cyan">{res.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referral Banner */}
      {!currentUser?.referred_by && (
        <div className="glass-panel hover-lift" onClick={() => navigate('/profile')} style={{ 
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' 
        }}>
          <div>
            <h4 style={{ color: '#F97316', margin: 0 }}>Complete Setup</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Enter referral code to unlock rewards!</p>
          </div>
          <ChevronRight color="#F97316" size={24} />
        </div>
      )}

      {/* BENTO BOX GRID START */}
      <div className="bento-grid">
        
        {/* Welcome / Identity (Span 12) */}
        <div className="bento-item glass-panel span-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              Welcome back, <span className="gradient-text-teal">{currentUser?.fullName?.split(' ')[0] || 'User'}</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--text-secondary)' }}>
               <MapPin size={16} />
               <span style={{ fontSize: '14px' }}>{currentUser?.location || currentUser?.permanent_pincode || 'Update Location'}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,192,0,0.1)', padding: '12px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,192,0,0.2)' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--tech-gold)', fontWeight: 'bold', letterSpacing: '1px' }}>Points</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award color="var(--tech-gold)" size={20} />
              <span style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: '800' }}>{currentUser?.points || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Access Services (Span 12) */}
        <div className="bento-item glass-panel span-12">
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Quick Access</h3>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
            {sortedModules.map(m => (
              <div key={m.id} onClick={() => navigate(m.path)} className="hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', minWidth: '72px' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '16px', 
                  background: `linear-gradient(135deg, ${m.color}22, transparent)`,
                  border: `1px solid ${m.color}44`,
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <m.icon color={m.color} size={28} />
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area (Span 8) */}
        <div className="bento-item span-8" style={{ padding: 0, gap: '20px', background: 'transparent' }}>
          <ErrorBoundary><DailyContentBoard data={feeds.content} /></ErrorBoundary>
          <ErrorBoundary><RegionalNews /></ErrorBoundary>
        </div>

        {/* Side Widgets Area (Span 4) */}
        <div className="bento-item span-4" style={{ padding: 0, gap: '20px', background: 'transparent' }}>
          <ErrorBoundary><WeatherWidget /></ErrorBoundary>
          <ErrorBoundary><AstroEdgeWidget /></ErrorBoundary>
          <ErrorBoundary><PollWidget /></ErrorBoundary>
        </div>

        {/* Admin Command Center (Span 12) */}
        {isAdmin && (
          <div className="bento-item glass-panel span-12 hover-lift" style={{ border: '1px solid rgba(255, 215, 0, 0.3)', background: 'rgba(255, 215, 0, 0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
               <ShieldAlert color="var(--tech-gold)" size={24} />
               <h3 style={{ margin: 0, color: 'var(--tech-gold)', fontSize: '18px' }}>Command Center</h3>
             </div>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
               <button className="btn-primary" onClick={() => navigate('/approval-hub')} style={{ background: 'var(--tech-gold)', color: '#000' }}>
                 <ShieldCheck size={20} /> Approvals
               </button>
               <button className="btn-outline" onClick={() => navigate('/admino')} style={{ borderColor: 'var(--tech-gold)', color: 'var(--tech-gold)' }}>
                 <Users size={20} /> Manage Users
               </button>
               <button className="btn-outline" onClick={() => navigate('/testo/admin')} style={{ borderColor: 'var(--tech-gold)', color: 'var(--tech-gold)' }}>
                 <ClipboardCheck size={20} /> Manage TestO
               </button>
             </div>
          </div>
        )}

      </div>
      {/* BENTO BOX GRID END */}

    </div>
  );
};

export default Dashboard;
