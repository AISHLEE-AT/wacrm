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
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/?override=1')}>
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
          .main-content-wrapper { margin-left: 0 !important; }
        }
        @media (min-width: 1024px) {
          .lg-hidden { display: none !important; }
          .main-content-wrapper { margin-left: 0 !important; }
        }
      `}} />
    </>
  );
}
