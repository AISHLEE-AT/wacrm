// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { lmsService } from '@/aishlee/services/lmsService';
import { Award, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function CertificateApprovals() {
  const { currentUser } = useApp();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Super Admin') {
      navigate('/dashboard');
      return;
    }
    loadRequests();
  }, [currentUser]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await lmsService.getAllCertificateRequests();
      setRequests(data);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to load requests", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, status) => {
    try {
      await lmsService.updateCertificateStatus(requestId, status, currentUser.id);
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--cool-gray)', textAlign: 'center' }}>Loading requests...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text-gold" style={{ fontSize: '28px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={32} color="var(--tech-gold)" /> Certificate Approvals
          </h1>
          <p className="text-muted" style={{ margin: 0 }}>Review and approve student course completions.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '18px', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Pending Requests ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cool-gray)' }}>No pending requests.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{req.course_id.replace('sheet-', '').replace(/-/g, ' ').toUpperCase()}</div>
                  <div style={{ color: 'var(--cool-gray)', fontSize: '14px', marginTop: '4px' }}>User: {req.auth_users?.email}</div>
                  <div style={{ color: 'var(--tech-cyan)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Requested: {new Date(req.requested_at).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction(req.id, 'approved')} className="btn-primary" style={{ background: '#25D366', color: 'black' }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => handleAction(req.id, 'rejected')} className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '18px', marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Processed Requests ({processedRequests.length})</h2>
        {processedRequests.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cool-gray)' }}>No processed requests.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {processedRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', opacity: 0.8 }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{req.course_id.replace('sheet-', '').replace(/-/g, ' ').toUpperCase()}</div>
                  <div style={{ color: 'var(--cool-gray)', fontSize: '13px', marginTop: '2px' }}>User: {req.auth_users?.email}</div>
                </div>
                <div style={{ color: req.status === 'approved' ? '#25D366' : '#EF4444', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Toast Notification */}
      {toast.show && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', borderRadius: '14px', zIndex: 99999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : 'var(--tech-cyan)',
          color: '#fff', fontWeight: '700', fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease-out',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
