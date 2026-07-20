// @ts-nocheck
'use client';
import { useApp } from '@/aishlee/context/AppProvider';
import { Users, User, Shield, MessageCircle } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LocalAdmin() {
  const { currentUser, allUsers } = useApp();
  const router = useRouter();
const navigate = (path) => router.push(path);

  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Local Admin') {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Access Denied. Local Admins only.</div>;
  }

  // Filter users allotted to this admin
  const myUsers = allUsers.filter(u => u.allotted_to === currentUser.id && u.role === 'User');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="var(--tech-cyan)" size={36} />
          <div>
            <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>Aishlee Local Admin</h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Manage and guide your allotted users</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '12px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{myUsers.length} / 100</div>
          <div style={{ fontSize: '12px', color: 'var(--tech-gold)' }}>Allotted Users</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Quick Actions */}
        <div className="glass-panel" style={{ width: '300px', padding: '24px', height: 'fit-content' }}>
          <h2 style={{ color: 'white', marginTop: 0, fontSize: '18px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => navigate('/approval-hub')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Review Pending Approvals
            </button>
            <button onClick={() => navigate('/admin/course-builder')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--tech-gold)', color: 'var(--tech-gold)' }}>
              Create LMS Content
            </button>
          </div>
          <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginTop: '24px', lineHeight: '1.5' }}>
            You are responsible for reviewing listings and guiding these specific users. When they submit ecosystem listings or finance requests, they will appear in your Approval Hub.
          </p>
        </div>

        {/* My Users List */}
        <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
          <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--tech-cyan)" /> My Allotted Users
          </h2>
          
          {myUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cool-gray)' }}>
              <User size={48} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
              <div>You have not been assigned any users yet.</div>
              <div style={{ fontSize: '13px', marginTop: '8px' }}>Please contact the Super Admin for allotment.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {myUsers.map(user => (
                <div key={user.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{user.full_name}</div>
                  
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    {user.whatsapp ? (
                      <button 
                        onClick={() => {
                          const num = user.whatsapp.replace(/\D/g, '');
                          window.open(`https://wa.me/${(String(num).replace(/\D/g, '').length === 10 ? '91' + String(num).replace(/\D/g, '') : String(num).replace(/\D/g, ''))}?text=Hi ${user.full_name}, this is your Local Admin from Thamizhan. How can I help you today?`, '_blank');
                        }}
                        className="btn-primary" 
                        style={{ flex: 1, background: '#25D366', color: 'black', padding: '6px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                    ) : (
                      <div style={{ flex: 1, color: 'var(--cool-gray)', fontSize: '12px', textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>No WhatsApp</div>
                    )}
                    <button 
                      onClick={() => navigate(`/resume/${user.id}`)}
                      className="btn-outline" 
                      style={{ flex: 1, padding: '6px', fontSize: '13px', display: 'flex', justifyContent: 'center' }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
