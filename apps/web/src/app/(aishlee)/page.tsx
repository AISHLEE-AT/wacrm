"use client";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, GraduationCap, Store, Landmark, ClipboardCheck, PlaySquare, CheckSquare, Plane, Car, Truck, Star } from 'lucide-react';
import { useApp } from '@/aishlee/context/AppProvider';

const MODULE_KEY = 'aishlee_last_module';

const MODULES = [
  { path: '/teacho',  label: 'TeachO',    icon: GraduationCap,   color: '#3B82F6', desc: 'Online Academy & Courses' },
  { path: '/testo',   label: 'TestO',     icon: ClipboardCheck,  color: '#EF4444', desc: 'Assessments & Exams' },
  { path: '/touro',   label: 'TourO',     icon: Plane,           color: '#10B981', desc: 'Travel & Tours' },
  { path: '/moneyo',  label: 'MoneyO',    icon: Landmark,        color: '#F59E0B', desc: 'Finance & Wallet' },
  { path: '/tasko',   label: 'TaskO',     icon: CheckSquare,     color: '#8B5CF6', desc: 'Task Management' },
  { path: '/tradeo',  label: 'TradeO',    icon: Store,           color: '#EC4899', desc: 'Business & Trade' },
  { path: '/tvo',     label: 'TvO',       icon: PlaySquare,      color: '#14B8A6', desc: 'Entertainment & Media' },
  { path: '/rido',    label: 'RidO',      icon: Car,             color: '#F43F5E', desc: 'Share-auto & Transport' },
  { path: '/drivo',   label: 'DrivO',     icon: Truck,           color: '#EAB308', desc: 'Logistics & Delivery' },
];

export default function RootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setDefaultModule } = useApp();
  const overrideRedirect = searchParams.get('override') === '1';

  useEffect(() => {
    if (currentUser?.default_module && !overrideRedirect) {
      router.replace(`/${currentUser.default_module}`);
    }
  }, [currentUser?.default_module, overrideRedirect, router]);

  const handleSelect = (path: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MODULE_KEY, path);
    }
    router.push(path);
  };

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', minHeight: '80vh'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0 0 12px 0', lineHeight: 1.2 }}>
            Where would you like<br/>
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to go today?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: 0 }}>Select a module to get started</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                onClick={() => handleSelect(mod.path)}
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
                <div style={{ background: `${mod.color}25`, padding: '16px', borderRadius: '16px', color: mod.color }}>
                  <Icon size={32} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '17px' }}>{mod.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>{mod.desc}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const moduleKey = mod.path.replace('/', '');
                    setDefaultModule(moduleKey);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: currentUser?.default_module === mod.path.replace('/', '') ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'color 0.2s',
                  }}
                  title="Set as Default Module"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F59E0B'}
                  onMouseLeave={(e) => {
                    if (currentUser?.default_module !== mod.path.replace('/', '')) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.2)';
                    }
                  }}
                >
                  <Star size={18} fill={currentUser?.default_module === mod.path.replace('/', '') ? '#F59E0B' : 'none'} />
                </button>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
