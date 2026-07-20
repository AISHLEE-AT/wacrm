'use client';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, GraduationCap, Store, Landmark, 
  ClipboardCheck, PlaySquare, ShieldAlert, UserCircle, 
  Menu, X, Search, CheckSquare, Plane
} from 'lucide-react';
import { useApp } from '../../context/AppProvider';
import { purchaseService } from '../../services/purchaseService';
import Logo from '../Logo';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import Footer from '../Footer';

export default function MainLayout({ children }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const location = { pathname };
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
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/teacho', label: 'TeachO', icon: GraduationCap },
    { path: '/testo', label: 'TestO', icon: ClipboardCheck },
    { path: '/moneyo', label: 'MoneyO', icon: Landmark },
    { path: '/tasko', label: 'TaskO', icon: CheckSquare },
    { path: '/touro', label: 'TourO', icon: Plane },
    { path: '/tradeo', label: 'TradeO', icon: Store },
    { path: '/tvo', label: 'TvO', icon: PlaySquare },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  if (currentUser?.role === 'Super Admin') {
    navItems.push({ path: '/admino', label: 'AdminO', icon: ShieldAlert });
  } else if (currentUser?.role === 'Admin') {
    navItems.push({ path: '/localadmin', label: 'My Node', icon: ShieldAlert });
  }

  // Determine active item
  const isActive = (path) => location.pathname === path;

  // The Header component (Top bar for mobile & desktop)
  const HeaderBar = () => (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      marginBottom: '24px'
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
        <NotificationBell />
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      {currentUser && (
        <aside className={`desktop-sidebar glass-panel no-print`} style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          bottom: '20px',
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          padding: '24px 16px',
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
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: active ? 'var(--deep-midnight)' : 'var(--text-secondary)',
                    background: active ? 'var(--tech-cyan)' : 'transparent',
                    fontWeight: active ? '700' : '500',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  className="hover-lift"
                  onMouseEnter={(e) => {
                    if(!active) {
                      e.currentTarget.style.background = 'var(--surface-2)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
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
              <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
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
              {navItems.filter(item => item.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className="glass-panel"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                      textDecoration: 'none', color: active ? 'var(--tech-cyan)' : 'var(--text-primary)',
                      border: active ? '1px solid var(--tech-cyan)' : '1px solid var(--surface-border)'
                    }}
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
        }
        @media (min-width: 1024px) {
          .lg-hidden { display: none !important; }
          .bottom-nav { display: none !important; }
          .main-content-wrapper { margin-left: 290px !important; }
        }
      `}} />
    </>
  );
}



