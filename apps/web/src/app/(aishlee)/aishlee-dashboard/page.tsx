// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { 
  ShieldCheck, GraduationCap, IndianRupee, MapPin, 
  Store, Cpu, PlaySquare, ShieldAlert, Award, ChevronRight, 
  TrendingUp, Search, Landmark, ClipboardCheck, Map, ClipboardList, Users, Sparkles,
  Car, Truck, MessageSquare, Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { dataService } from '@/aishlee/services/dataService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

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
      } catch (err) {
        console.error("Failed to load feeds", err);
      }
    }
    loadFeeds();
  }, []);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const firstName = currentUser?.fullName?.split(' ')[0] || 'Guest';

  const modules = [
    { id: 'teacho', icon: GraduationCap, label: 'TeachO', color: '#00E5FF', bg: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05))', path: '/teacho', weight: currentUser?.main_category === 'Student' || currentUser?.main_category === 'Teacher' ? 10 : 0 },
    { id: 'testo', icon: ClipboardCheck, label: 'TestO', color: '#EF4444', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', path: '/testo', weight: currentUser?.main_category === 'Student' ? 9 : 0 },
    { id: 'toolso', icon: Cpu, label: 'ToolsO', color: '#10B981', bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', path: '/toolso', weight: currentUser?.main_category === 'Farmer' || currentUser?.main_category === 'Professional' ? 8 : 1 },
    { id: 'tradeo', icon: Store, label: 'TradeO', color: '#F97316', bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))', path: '/tradeo', weight: currentUser?.main_category === 'Farmer' || currentUser?.main_category === 'Trader' ? 10 : 2 },
    { id: 'careers', icon: TrendingUp, label: 'Careers', color: '#8B5CF6', bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', path: '/careers', weight: currentUser?.main_category === 'Professional' || currentUser?.main_category === 'Employee' || currentUser?.main_category === 'Employer' ? 10 : 3 },
    { id: 'moneyo', icon: Landmark, label: 'MoneyO', color: '#3B82F6', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))', path: '/moneyo', weight: currentUser?.main_category === 'Financier' || currentUser?.main_category === 'Trader' ? 10 : 4 },
    { id: 'touro', icon: Map, label: 'TourO', color: '#14B8A6', bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))', path: '/touro', weight: 5 },
    { id: 'tasko', icon: ClipboardList, label: 'TaskO', color: '#D946EF', bg: 'linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(217, 70, 239, 0.05))', path: '/tasko', weight: currentUser?.main_category === 'Employee' || currentUser?.main_category === 'Professional' ? 10 : (currentUser?.main_category === 'Student' ? 9 : 0) },
    { id: 'rido', icon: Car, label: 'RidO', color: '#F43F5E', bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.05))', path: '/rido', weight: currentUser?.main_category === 'Driver' ? 10 : 6 },
    { id: 'drivo', icon: Truck, label: 'DrivO', color: '#EAB308', bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))', path: '/drivo', weight: currentUser?.main_category === 'Driver' ? 10 : 7 },
  ];
  
  if (isAdmin) modules.push({ id: 'admino', icon: ShieldCheck, label: 'AdminO', color: '#FFD700', bg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))', path: '/admino', weight: 100 });
  const sortedModules = modules.sort((a, b) => b.weight - a.weight);

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}>
      
      {/* 2026 AI Conversational Header */}
      <div className="glass-panel" style={{ 
        position: 'relative', overflow: 'hidden', padding: '32px 24px', borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(139,92,246,0.05))',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Glow effect behind */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles color="#00E5FF" size={20} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Assistant</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            {greeting}, <span className="gradient-text-teal">{firstName}</span>.
            <br/><span style={{ color: 'var(--text-secondary)' }}>What do you need today?</span>
          </h1>
          
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '100px', display: 'flex', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ padding: '0 16px' }}>
                <Search color="var(--text-secondary)" size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Ask AI or search ecosystem..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length >= 3) setShowSearchDropdown(true) }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                style={{ 
                  flex: 1, background: 'transparent', border: 'none', color: '#fff', 
                  fontSize: '16px', padding: '16px 0', outline: 'none' 
                }} 
              />
              <button style={{ 
                background: 'var(--primary-teal)', color: '#000', borderRadius: '100px', 
                padding: '12px 24px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginRight: '4px'
              }}>
                Ask
              </button>
            </div>
            
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="glass-panel" style={{
                position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0, zIndex: 100, 
                padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {isSearching ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div> : null}
                {!isSearching && searchResults.map((res, i) => (
                  <div key={i} onClick={() => navigate(res.path)} className="hover-lift" style={{ 
                    padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', 
                    alignItems: 'center', cursor: 'pointer', marginBottom: '4px' 
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{res.title}</span>
                    <span style={{ background: 'rgba(0,229,255,0.1)', color: '#00E5FF', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>{res.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern App Bento Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Ecosystem Apps</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,192,0,0.1)', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(255,192,0,0.2)' }}>
            <Award color="var(--tech-gold)" size={16} />
            <span style={{ color: 'var(--tech-gold)', fontWeight: 'bold', fontSize: '14px' }}>{currentUser?.points || 0} pts</span>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' 
        }}>
          {sortedModules.map(m => (
            <div key={m.id} onClick={() => navigate(m.path)} className="glass-panel hover-lift" style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', 
              padding: '24px 16px', borderRadius: '24px', cursor: 'pointer', border: `1px solid ${m.color}33`,
              background: m.bg
            }}>
              <m.icon color={m.color} size={36} strokeWidth={1.5} />
              <span style={{ fontSize: '15px', color: '#fff', fontWeight: '600', letterSpacing: '0.5px' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Content Bento Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <ErrorBoundary>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <DailyContentBoard data={feeds.content} />
          </div>
        </ErrorBoundary>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ErrorBoundary>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <WeatherWidget />
            </div>
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <RegionalNews />
            </div>
          </ErrorBoundary>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ErrorBoundary>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <AstroEdgeWidget />
            </div>
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <PollWidget />
            </div>
          </ErrorBoundary>
        </div>
      </div>

      {/* Admin Command Center */}
      {isAdmin && (
        <div className="glass-panel hover-lift" style={{ 
          padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 215, 0, 0.3)', 
          background: 'rgba(255, 215, 0, 0.05)' 
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
             <ShieldAlert color="var(--tech-gold)" size={24} />
             <h3 style={{ margin: 0, color: 'var(--tech-gold)', fontSize: '20px', fontWeight: 'bold' }}>Command Center</h3>
           </div>
           <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
             <button onClick={() => navigate('/approval-hub')} style={{ 
               background: 'var(--tech-gold)', color: '#000', padding: '12px 24px', borderRadius: '100px', 
               fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' 
             }}>
               <ShieldCheck size={20} /> Approvals
             </button>
             <button onClick={() => navigate('/admino')} style={{ 
               background: 'transparent', color: 'var(--tech-gold)', border: '1px solid var(--tech-gold)', 
               padding: '12px 24px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
             }}>
               <Users size={20} /> Manage Users
             </button>
             <button onClick={() => navigate('/admin/drivers')} style={{ 
               background: 'transparent', color: 'var(--tech-gold)', border: '1px solid var(--tech-gold)', 
               padding: '12px 24px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
             }}>
               <Car size={20} /> Drivers
             </button>
             <button onClick={() => navigate('/admin/providers')} style={{ 
               background: 'transparent', color: 'var(--tech-gold)', border: '1px solid var(--tech-gold)', 
               padding: '12px 24px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
             }}>
               <Briefcase size={20} /> Providers
             </button>
             <button onClick={() => navigate('/broadcasts')} style={{ 
               background: 'transparent', color: 'var(--tech-gold)', border: '1px solid var(--tech-gold)', 
               padding: '12px 24px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
             }}>
               <MessageSquare size={20} /> WA CRM
             </button>
             <button onClick={() => navigate('/testo/admin')} style={{ 
               background: 'transparent', color: 'var(--tech-gold)', border: '1px solid var(--tech-gold)', 
               padding: '12px 24px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
             }}>
               <ClipboardCheck size={20} /> Manage TestO
             </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
