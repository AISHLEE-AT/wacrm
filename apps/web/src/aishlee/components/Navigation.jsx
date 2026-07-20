'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Sparkles, GraduationCap, Store, Landmark, PlaySquare, ShieldAlert, UserCircle, Bell, ClipboardCheck } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { purchaseService } from '../services/purchaseService';

const Navigation = () => {
  const location = useLocation();
  const { currentUser } = useApp();
  const [pendingCount, setPendingCount] = useState(0);

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

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/teacho', label: 'TeachO', icon: GraduationCap },
    { path: '/tradeo', label: 'TradeO', icon: Store },
    { path: '/moneyo', label: 'MoneyO', icon: Landmark },
    { path: '/testo', label: 'TestO', icon: ClipboardCheck },
    { path: '/tvo', label: 'TvO', icon: PlaySquare },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  if (currentUser?.role === 'Super Admin') {
    navItems.push({ path: '/admino', label: 'AdminO', icon: ShieldAlert });
  } else if (currentUser?.role === 'Admin') {
    navItems.push({ path: '/localadmin', label: 'My Node', icon: ShieldAlert });
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <IconComponent size={24} />
            <span>{item.label}</span>
            {/* Show Notification Badge for Admin tabs if there are pending payments */}
            {(item.path === '/superadmin' || item.path === '/localadmin' || item.path === '/approval-hub') && pendingCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '4px',
                background: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {pendingCount}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
