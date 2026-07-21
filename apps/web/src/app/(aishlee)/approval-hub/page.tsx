// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { ecosystemService } from '@/aishlee/services/ecosystemService';
import { financeService } from '@/aishlee/services/financeService';
import { recruitmentService } from '@/aishlee/services/recruitmentService';
import { generateAppointmentOrder } from '@/aishlee/utils/pdfGenerator';
import { CheckCircle, XCircle, MessageSquare, ShieldAlert, DatabaseZap, Users, Link, Briefcase, FileText, Download, Star, Award, Store } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import ChatBox from '@/aishlee/components/ChatBox';
import AdminBulkUpload from '@/aishlee/components/AdminBulkUpload';

export default function ApprovalHub() {
  const { currentUser, allUsers } = useApp();
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [matchSelections, setMatchSelections] = useState({});
  const [activeTab, setActiveTab] = useState('ecosystem'); // 'ecosystem' or 'recruitment'
  const [generatingPdf, setGeneratingPdf] = useState<any>(null);

  // Gamification Reward State
  const [rewardPhone, setRewardPhone] = useState<string>('');
  const [rewardPoints, setRewardPoints] = useState(50);
  const [rewardStatus, setRewardStatus] = useState<string>('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const isSuperAdmin = currentUser?.role === 'Super Admin';
      const filters = { status: 'PENDING' };
      
      // 1. Fetch Ecosystem Listings (fetch all pending first)
      let ecosystemData = await ecosystemService.getListings(filters);
      
      // 2. Fetch Finance Loans (fetch all pending first)
      let financeData = await financeService.getLoans(filters);

      // Filter in JS so Admins can see items allotted to them OR created by themselves
      if (!isSuperAdmin) {
        ecosystemData = ecosystemData.filter(item => 
          item.profiles?.allotted_to === currentUser.id || item.lister_id === currentUser.id
        );
        financeData = financeData.filter(loan => 
          loan.profiles?.allotted_to === currentUser.id || loan.applicant_id === currentUser.id
        );
      }

      // 3. Fetch Job Applications (Super Admin only typically, but we allow Admin to screen)
      const appsData = await recruitmentService.getPendingApplications();

      // Normalize Finance Loans to match Listing format for the UI
      const normalizedLoans = (financeData || []).map(loan => ({
        id: loan.id,
        isLoanModel: true,
        type: 'Crowdfunding / Loan',
        title: loan.business_name,
        description: loan.purpose,
        price: loan.amount,
        profiles: loan.profiles,
        details: {
          'Target Amount': `₹${loan.amount}`,
          'Progress': `${loan.funded_percentage}% Funded`
        }
      }));

      // Combine and Sort
      const combined = [...ecosystemData, ...normalizedLoans].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setPendingListings(combined);
      setPendingApplications(appsData || []);
    } catch (err: any) {
      console.error("Error loading pending approvals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (item, status) => {
    try {
      if (item.isLoanModel) {
        await financeService.updateLoanStatus(item.id, status === 'APPROVED' ? 'APPROVED' : 'REJECTED');
      } else {
        await ecosystemService.updateListingStatus(item.id, status);
      }
      setPendingListings(prev => prev.filter(l => l.id !== item.id));
      if (activeChat === item.id) setActiveChat(null);
    } catch (err: any) {
      console.error("Action failed", err);
    }
  };

  const openWhatsApp = (phone, text) => {
    if (!phone) return showToast("No phone number available.", 'error');
    window.open(`https://wa.me/${(String(phone.replace(/\D/g, '')).replace(/\D/g, '').length === 10 ? '91' + String(phone.replace(/\D/g, '')).replace(/\D/g, '') : String(phone.replace(/\D/g, '')).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWhatsAppLister = (listing) => {
    const text = `Hi ${listing.profiles?.full_name}, I am an Admin reviewing your listing for "${listing.title}" on the Digital Marketplace...`;
    openWhatsApp(listing.profiles?.whatsapp, text);
  };

  const handleWhatsAppMatchedUser = (listing) => {
    const matchedUserId = matchSelections[listing.id];
    if (!matchedUserId) return showToast("Select a user to match first.", 'error');
    const matchedUser = allUsers.find(u => u.id === matchedUserId);
    if (!matchedUser) return;
    const text = `Hi ${matchedUser.full_name}, we found a listing on the Digital Marketplace that matches your needs: "${listing.title}" by ${listing.profiles?.full_name} for ₹${listing.price}. Are you interested?`;
    openWhatsApp(matchedUser.whatsapp, text);
  };

  const handleBulkSeed = async () => {
    if (!window.confirm("This will inject realistic AI-curated test data into the public ecosystem. Proceed?")) return;
    setSeeding(true);
    try {
      await ecosystemService.injectDemoData(currentUser.id);
      showToast("Success! 8 realistic listings have been injected and auto-approved.", 'success');
      await loadPending(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to seed", err);
      showToast(`Failed to seed data: ${err.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  // RECRUITMENT SPECIFIC HANDLERS
  const handleScreeningInterview = (app) => {
    const text = `Hi ${app.profiles?.full_name}, this is HR from Aishlee Tech. We have reviewed your application for the ${app.job_title} role and would like to schedule a quick screening interview. When are you available?`;
    openWhatsApp(app.profiles?.whatsapp, text);
  };

  const handleAppoint = async (app) => {
    if (currentUser.role !== 'Super Admin') {
      return showToast("Only Super Admins can issue Appointment Orders.", 'error');
    }
    
    try {
      setGeneratingPdf(app.id);
      // Generate PDF
      const pdfFileName = await generateAppointmentOrder(app);
      
      // Update status in DB
      await recruitmentService.updateApplicationStatus(app.id, 'APPOINTED');
      setPendingApplications(prev => prev.filter(a => a.id !== app.id));
      
      // Trigger WA message
      const text = `Congratulations ${app.profiles?.full_name}! You have been officially appointed as ${app.job_title} at Aishlee Tech. I have attached your official Appointment Order PDF (please see the document I'm sending next).`;
      openWhatsApp(app.profiles?.whatsapp, text);
      
    } catch (err: any) {
      console.error("Failed to appoint", err);
      showToast("Error generating appointment order.", 'error');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleRejectApp = async (app) => {
    try {
      await recruitmentService.updateApplicationStatus(app.id, 'REJECTED');
      setPendingApplications(prev => prev.filter(a => a.id !== app.id));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRewardReferrer = async (e) => {
    e.preventDefault();
    if (!rewardPhone) return;
    try {
      setRewardStatus('Processing...');
      // Extract numbers only
      const cleanPhone = rewardPhone.replace(/\D/g, '');
      const { data: users } = await supabase.from('profiles').select('id, points').like('whatsapp', `%${cleanPhone}%`);
      
      if (!users || users.length === 0) {
        setRewardStatus('User not found.');
        return;
      }
      const user = users[0];
      const newPts = (user.points || 0) + parseInt(rewardPoints);
      await supabase.from('profiles').update({ points: newPts }).eq('id', user.id);
      setRewardStatus(`Success! New balance: ${newPts} pts.`);
      setRewardPhone('');
      setTimeout(() => setRewardStatus(''), 4000);
    } catch (err: any) {
      console.error(err);
      setRewardStatus('Error adding points.');
    }
  };

  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Super Admin') {
    return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Access Denied. Admins Only.</div>;
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={32} color="var(--tech-cyan)" />
          <div>
            <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>Aishlee Approvals</h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Review, Screen, and Approve everything securely.</p>
          </div>
        </div>
        <button 
          onClick={handleBulkSeed} 
          disabled={seeding}
          className="btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--tech-gold)', color: 'var(--tech-gold)' }}
        >
          <DatabaseZap size={18} /> {seeding ? 'Injecting Data...' : 'Generate Curated Demo Data'}
        </button>
      </div>

      {/* Gamification Panel */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', borderLeft: '4px solid var(--logo-orange)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '8px', borderRadius: '50%' }}>
            <Award size={24} color="var(--logo-orange)" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>Reward Referrer</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--cool-gray)' }}>Did someone refer a sale via WhatsApp? Grant them rank points!</p>
          </div>
        </div>
        
        <form onSubmit={handleRewardReferrer} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Referrer WhatsApp" 
            className="input-field" 
            value={rewardPhone}
            onChange={e => setRewardPhone(e.target.value)}
            style={{ width: '180px', padding: '6px 12px', fontSize: '13px' }}
            required
          />
          <input 
            type="number" 
            className="input-field" 
            value={rewardPoints}
            onChange={e => setRewardPoints(e.target.value)}
            style={{ width: '80px', padding: '6px 12px', fontSize: '13px' }}
            required
          />
          <button type="submit" className="btn-primary" style={{ background: 'var(--logo-orange)', border: 'none', padding: '6px 16px', fontSize: '13px' }}>
            <Star size={14} className="inline mr-1" /> Award Points
          </button>
          {rewardStatus && <span style={{ fontSize: '12px', color: rewardStatus.includes('Success') ? '#10B981' : '#EF4444', marginLeft: '8px' }}>{rewardStatus}</span>}
        </form>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('ecosystem')}
          className="btn-outline"
          style={{ 
            background: activeTab === 'ecosystem' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            borderColor: activeTab === 'ecosystem' ? 'var(--tech-cyan)' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'ecosystem' ? 'var(--tech-cyan)' : 'white'
          }}
        >
          <Store size={18} className="mr-2 inline" /> Ecosystem & Finance ({pendingListings.length})
        </button>
        <button 
          onClick={() => setActiveTab('recruitment')}
          className="btn-outline"
          style={{ 
            background: activeTab === 'recruitment' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            borderColor: activeTab === 'recruitment' ? '#8B5CF6' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'recruitment' ? '#8B5CF6' : 'white'
          }}
        >
          <Briefcase size={18} className="mr-2 inline" /> HR & Recruitment ({pendingApplications.length})
        </button>
      </div>

      {activeTab === 'ecosystem' && <AdminBulkUpload onUploadSuccess={loadPending} />}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--cool-gray)', padding: 40 }}>Scanning pending queues...</div>
      ) : activeTab === 'ecosystem' ? (
        // ECOSYSTEM & FINANCE TAB
        pendingListings.length === 0 ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--tech-teal)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ margin: 0, color: 'white' }}>All Caught Up!</h3>
            <p className="text-muted">There are no pending submissions in the network.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingListings.map(listing => (
                <div key={listing.id} className="glass-panel" style={{ 
                  padding: '20px', 
                  borderLeft: activeChat === listing.id ? '4px solid var(--tech-cyan)' : '4px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: '20px', 
                        background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' 
                      }}>
                        {(listing.type || 'General').toUpperCase()}
                      </span>
                      <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '18px' }}>{listing.title}</h3>
                      <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px' }}>
                        By: {listing.profiles?.full_name} | Price: ₹{listing.price || '0.00'}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleWhatsAppLister(listing)}
                        className="btn-outline" 
                        style={{ padding: '8px 12px', borderColor: '#25D366', color: '#25D366' }}
                      >WA Lister</button>
                      {!listing.isLoanModel && (
                        <button 
                          onClick={() => setActiveChat(activeChat === listing.id ? null : listing.id)}
                          className="btn-outline" 
                          style={{ padding: '8px 12px' }}
                        ><MessageSquare size={18} /></button>
                      )}
                      <button 
                        onClick={() => handleAction(listing, 'APPROVED')}
                        className="btn-primary" 
                        style={{ padding: '8px 16px', background: 'var(--tech-teal)', border: 'none' }}
                      >Approve</button>
                      <button 
                        onClick={() => handleAction(listing, 'REJECTED')}
                        className="btn-outline" 
                        style={{ padding: '8px 16px', color: '#EF4444', borderColor: '#EF4444' }}
                      >Reject</button>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px' }}>
                    <p style={{ margin: '0 0 8px 0' }}>{listing.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
              {activeChat ? (
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: 'white' }}>Live Communication</h3>
                  <ChatBox listingId={activeChat} />
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--cool-gray)' }}>
                  <MessageSquare size={40} style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
                  Click the chat icon on any listing to communicate.
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        // RECRUITMENT TAB
        pendingApplications.length === 0 ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
            <Users size={48} color="#8B5CF6" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ margin: 0, color: 'white' }}>No Pending Applications</h3>
            <p className="text-muted">No new candidates have applied yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {pendingApplications.map(app => (
              <div key={app.id} className="glass-panel stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {app.category}
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '8px 0 0 0' }}>{app.job_title}</h3>
                    </div>
                  </div>
                </div>

                {/* Candidate Info */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--tech-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} /> Candidate Profile
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#E2E8F0' }}>
                    <div><strong>Name:</strong> {app.profiles?.full_name}</div>
                    <div><strong>Education:</strong> {app.profiles?.education_level}</div>
                    <div><strong>Location:</strong> {app.profiles?.location}</div>
                    <div><strong>Status:</strong> {app.profiles?.employment_status}</div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong style={{ color: 'var(--cool-gray)', fontSize: '12px', textTransform: 'uppercase' }}>Cover Letter:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', color: '#CBD5E1' }}>"{app.cover_letter}"</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleScreeningInterview(app)}
                    className="btn-outline" 
                    style={{ flex: 1, padding: '8px', borderColor: '#25D366', color: '#25D366', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={16} /> Screen
                  </button>
                  <button 
                    onClick={() => handleRejectApp(app)}
                    className="btn-outline" 
                    style={{ flex: 1, padding: '8px', color: '#EF4444', borderColor: '#EF4444' }}
                  >
                    Reject
                  </button>
                  {currentUser.role === 'Super Admin' && (
                    <button 
                      onClick={() => handleAppoint(app)}
                      disabled={generatingPdf === app.id}
                      className="btn-primary" 
                      style={{ flex: 1.5, padding: '8px', background: '#8B5CF6', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      {generatingPdf === app.id ? <><Download size={16} className="animate-bounce"/> Gen PDF...</> : <><FileText size={16} /> Appoint</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

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
