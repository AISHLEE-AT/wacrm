'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, GraduationCap, Store, Landmark, 
  ClipboardCheck, PlaySquare, ShieldAlert, UserCircle, 
  Menu, X, Search, CheckSquare, Plane, Zap, ChevronRight,
  BookOpen, Target, Tv, Wallet, Map, Tool, DollarSign, Car, Truck, MessageCircle, Settings, Users
} from 'lucide-react';
import { useApp } from '../../context/AppProvider';
import { purchaseService } from '../../services/purchaseService';
import Logo from '../Logo';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import Footer from '../Footer';

// UniversalModuleSelector has been moved to page.tsx (Home Page)

export default function MainLayout({ children }) {
  const { currentUser, isProfileComplete } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [navSearchQuery, setNavSearchQuery] = useState('');

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

  // Auth Guard: redirect to login if not authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Give AppProvider time to check session (don't redirect during loading)
    const timer = setTimeout(() => {
      if (!currentUser && !['/login', '/signup', '/forgot-password'].some(p => pathname?.startsWith(p))) {
        router.push('/login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentUser, pathname]);

  // Profile Guard: redirect to setup if profile is incomplete
  useEffect(() => {
    if (!currentUser) return;
    if (!isProfileComplete && pathname !== '/setup') {
      router.push('/setup');
    }
  }, [currentUser, isProfileComplete, pathname]);

  const navItems = [
    { path: '/',        label: 'Home',    icon: LayoutDashboard },
    { path: '/teacho',  label: 'TeachO',  icon: GraduationCap },
    { path: '/testo',   label: 'TestO',   icon: ClipboardCheck },
    { path: '/moneyo',  label: 'MoneyO',  icon: Landmark },
    { path: '/tasko',   label: 'TaskO',   icon: CheckSquare },
    { path: '/touro',   label: 'TourO',   icon: Plane },
    { path: '/tradeo',  label: 'TradeO',  icon: Store },
    { path: '/rido',    label: 'RidO',    icon: Car },
    { path: '/drivo',   label: 'DrivO',   icon: Truck },
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
        {/* Modules Button Navigates Home Now */}
        {currentUser && (
          <button
            onClick={() => router.push('/?override=1')}
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
                onClick={() => { setIsMobileMenuOpen(false); router.push('/?override=1'); }}
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
