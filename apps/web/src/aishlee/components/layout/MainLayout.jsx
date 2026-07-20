'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, GraduationCap, Store, Landmark, 
  ClipboardCheck, PlaySquare, ShieldAlert, UserCircle, 
  Menu, X, Search, CheckSquare, Plane, Zap, ChevronRight,
  BookOpen, Target, Tv, Wallet, Map, Tool, DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppProvider';
import { purchaseService } from '../../services/purchaseService';
import Logo from '../Logo';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import Footer from '../Footer';

// ─── Universal Module Selector (shown once after login) ───────────────────────
const MODULE_KEY = 'aishlee_last_module';

const MODULES = [
  { path: '/',        label: 'Home',      icon: LayoutDashboard, color: '#6366F1', desc: 'Dashboard & overview' },
  { path: '/teacho',  label: 'TeachO',    icon: GraduationCap,   color: '#3B82F6', desc: 'Online Academy & Courses' },
  { path: '/testo',   label: 'TestO',     icon: ClipboardCheck,  color: '#EF4444', desc: 'Assessments & Exams' },
  { path: '/touro',   label: 'TourO',     icon: Plane,           color: '#10B981', desc: 'Travel & Tours' },
  { path: '/moneyo',  label: 'MoneyO',    icon: Landmark,        color: '#F59E0B', desc: 'Finance & Wallet' },
  { path: '/tasko',   label: 'TaskO',     icon: CheckSquare,     color: '#8B5CF6', desc: 'Task Management' },
  { path: '/tradeo',  label: 'TradeO',    icon: Store,           color: '#EC4899', desc: 'Business & Trade' },
  { path: '/tvo',     label: 'TvO',       icon: PlaySquare,      color: '#14B8A6', desc: 'Entertainment & Media' },
];

function UniversalModuleSelector({ onSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #050A18 0%, #0A0F1E 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto'
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '700px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <Logo size={32} />
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '20px 0 12px 0', lineHeight: 1.2 }}>
            Where would you like<br/>
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to go today?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: 0 }}>Select a module to get started</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                onClick={() => onSelect(mod.path)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '20px',
                  padding: '24px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  color: 'white',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${mod.color}20`;
                  e.currentTarget.style.borderColor = `${mod.color}60`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${mod.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ background: `${mod.color}25`, padding: '12px', borderRadius: '16px', color: mod.color }}>
                  <Icon size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '16px' }}>{mod.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{mod.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '24px' }}>
          Your choice will be remembered for next time
        </p>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function MainLayout({ children }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  // Show module selector once per session when user first logs in
  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      const lastModule = window.sessionStorage.getItem(MODULE_KEY);
      // Show selector only if: user just logged in (no session module) AND they're at the root
      if (!lastModule && pathname === '/') {
        setShowModuleSelector(true);
      }
    } else if (!currentUser) {
      setShowModuleSelector(false);
    }
  }, [currentUser?.id, pathname]);

  const handleModuleSelect = (path) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MODULE_KEY, path);
    }
    setShowModuleSelector(false);
    router.push(path);
  };

  useEffect(() => {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') {
      const fetchPending = async () => {
        try {
          const purchases = await purchaseService.getPendingPurchases();
          setPendingCount(purchases ? purchases.length : 0);
        } catch (e) {
          console.error(e);
        }
      };
      
      fetchPending();
    }
  }, [currentUser?.role]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { path: '/',        label: 'Home',    icon: LayoutDashboard },
    { path: '/teacho',  label: 'TeachO',  icon: GraduationCap },
    { path: '/testo',   label: 'TestO',   icon: ClipboardCheck },
    { path: '/moneyo',  label: 'MoneyO',  icon: Landmark },
    { path: '/tasko',   label: 'TaskO',   icon: CheckSquare },
    { path: '/touro',   label: 'TourO',   icon: Plane },
    { path: '/tradeo',  label: 'TradeO',  icon: Store },
    { path: '/tvo',     label: 'TvO',     icon: PlaySquare },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  if (currentUser?.role === 'Super Admin') {
    navItems.push({ path: '/admino',     label: 'AdminO',  icon: ShieldAlert });
  } else if (currentUser?.role === 'Admin') {
    navItems.push({ path: '/localadmin', label: 'My Node', icon: ShieldAlert });
  }

  // Determine active item
  const isActive = (path) => pathname === path;

  // The Header component (Top bar for mobile & desktop)
  const HeaderBar = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 24px',
      position: 'sticky',
      top: '20px',
      zIndex: 100,
      borderRadius: '20px',
      background: 'rgba(10, 15, 30, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '32px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="lg-hidden" 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
        <div className="lg-hidden">
          <Logo size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Module Switcher button for quick re-selection */}
        {currentUser && (
          <button
            onClick={() => setShowModuleSelector(true)}
            title="Switch Module"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366F1',
              borderRadius: '10px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={14} /> Modules
          </button>
        )}
        <NotificationBell />
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      {/* Universal Module Selector Overlay */}
      {showModuleSelector && (
        <UniversalModuleSelector onSelect={handleModuleSelect} />
      )}

      {/* DESKTOP SIDEBAR */}
      {currentUser && (
        <aside className={`desktop-sidebar no-print`} style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          bottom: '20px',
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          padding: '24px 16px',
          background: 'rgba(10, 15, 30, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
            <Logo size={24} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--cool-gray)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
            {navItems.filter(item => item.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    boxShadow: active ? '0 4px 12px rgba(99,102,241,0.1)' : 'none',
                    fontWeight: active ? '700' : '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  className="hover-lift"
                  onMouseEnter={(e) => {
                    if(!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  
                  {/* Notification Badge */}
                  {['/admino', '/localadmin'].includes(item.path) && pendingCount > 0 && (
                    <div style={{
                      position: 'absolute', right: '12px', background: '#EF4444', color: 'white',
                      borderRadius: '50%', width: '20px', height: '20px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {pendingCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          
        </aside>
      )}

      {/* MOBILE BOTTOM NAV */}
      {currentUser && (
        <nav className="bottom-nav lg-hidden no-print">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} className={`nav-item ${active ? 'active' : ''}`}>
                <Icon size={24} style={{ color: active ? 'var(--tech-cyan)' : 'var(--cool-gray)' }} />
                <span style={{ color: active ? 'var(--tech-cyan)' : 'var(--cool-gray)' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* MOBILE EXPANDED MENU MODAL */}
      {isMobileMenuOpen && (
        <div className="mobile-fullscreen-modal lg-hidden no-print" style={{ zIndex: 99999 }}>
          <div className="mobile-modal-content" style={{ background: 'var(--deep-midnight)' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)' }}>
              <Logo size={20} />
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
                <X size={28} />
              </button>
            </div>
            
            <div style={{ padding: '20px 20px 0 20px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="var(--cool-gray)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search menu..." 
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {/* Module Switcher in Mobile Menu */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowModuleSelector(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', color: '#6366F1', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <Zap size={24} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>Switch Module</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>Quick module selector</div>
                </div>
              </button>
              {navItems.filter(item => item.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className="glass-panel"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                      textDecoration: 'none', color: active ? 'var(--tech-cyan)' : 'var(--text-primary)',
                      border: active ? '1px solid var(--tech-cyan)' : '1px solid var(--surface-border)'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={24} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {currentUser && <HeaderBar />}
        <main style={{ flex: 1, padding: '0 20px', paddingBottom: '20px' }}>
          {children}
        </main>
        {currentUser && <Footer />}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1023px) {
          .desktop-sidebar { display: none !important; }
          .main-content-wrapper { margin-left: 0 !important; }
        }
        @media (min-width: 1024px) {
          .lg-hidden { display: none !important; }
          .bottom-nav { display: none !important; }
          .main-content-wrapper { margin-left: ${currentUser ? '290px' : '0'} !important; }
        }
      `}} />
    </>
  );
}
