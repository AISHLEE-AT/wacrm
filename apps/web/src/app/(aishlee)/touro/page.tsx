// @ts-nocheck
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { Compass, MessageCircle, Info, Check, ShieldCheck, X } from 'lucide-react';
import { PaymentQR } from '@/aishlee/components/PaymentQR';
import { purchaseService } from '../services/purchaseService';

const TourO = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    async function fetchTours() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'tour')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTours(data || []);
      } catch (err) {
        console.error("Error fetching tours:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  const groupedTours = useMemo(() => {
    const groups = {};
    tours.forEach(tour => {
      const cat = tour.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      
      let metadata = {};
      try {
        if (tour.additional_info) metadata = JSON.parse(tour.additional_info);
      } catch(e) {}
      
      groups[cat].push({ ...tour, _metadata: metadata });
    });
    return groups;
  }, [tours]);

  const handlePayEMI = (tour) => {
    if (!currentUser) {
      alert("Please login first to join a tour plan.");
      navigate('/login');
      return;
    }
    setSelectedTour(tour);
    setShowPayment(true);
    setAgreementAccepted(false);
    setPaymentId('');
  };

  const submitPayment = async () => {
    if (!paymentId.trim()) {
      alert("Please enter the Payment ID (Transaction Reference).");
      return;
    }
    setSubmittingPayment(true);
    try {
      const bName = currentUser.fullName || currentUser.full_name || currentUser.user_metadata?.full_name || 'User';
      const bContact = currentUser.whatsapp || '';
      
      await purchaseService.submitPurchase(
        currentUser.id, 
        selectedTour.id, 
        'tour_emi', 
        paymentId.trim(), 
        bName, 
        bContact
      );
      
      alert("Your EMI Payment has been submitted successfully for Admin approval!");
      setShowPayment(false);
      setPaymentId('');
    } catch (e) {
      alert("Failed to submit payment. Please try again.");
    }
    setSubmittingPayment(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px', paddingBottom: '80px', color: 'white' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px' }}>
            <Compass color="#10B981" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>TourO Module</h1>
            <p style={{ fontSize: '13px', color: 'var(--cool-gray)', margin: 0 }}>Discover Pilgrimage & EcoTourism</p>
          </div>
        </div>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
          <button 
            onClick={() => navigate('/touro/admin')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '14px', background: 'var(--tech-cyan)', color: 'black' }}
          >
            Manage Tours
          </button>
        )}
      </div>

      <div style={{ background: 'linear-gradient(135deg, #065f46, #047857)', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 10px 25px rgba(4, 120, 87, 0.3)' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Travel Now, Save Smart!</h2>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
          Join our exclusive Pilgrimage & EcoTourism saving schemes. Pay EMIs monthly, and get bonus FREE EMIs sponsored by the Package Provider. Perfect for your year-end trips!
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cool-gray)' }}>Loading tours...</div>
      ) : Object.keys(groupedTours).length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--cool-gray)' }}>
          <Compass size={48} opacity={0.5} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No tours available yet. Check back soon!
        </div>
      ) : (
        Object.entries(groupedTours).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '16px' }}>{category}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {items.map(tour => {
                const emi = tour._metadata?.emiAmount || 0;
                const uMonths = tour._metadata?.userMonths || 0;
                const pMonths = tour._metadata?.providerMonths || 0;
                
                return (
                  <div key={tour.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 'bold' }}>{tour.title_name}</h4>
                    {tour._metadata?.sub_category && (
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--cool-gray)', marginBottom: '12px' }}>
                        {tour._metadata.sub_category}
                      </span>
                    )}
                    <p style={{ fontSize: '14px', color: 'var(--cool-gray)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>{tour.description}</p>
                    
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>EMI SAVING PLAN</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                        <span>You Pay:</span>
                        <strong style={{ color: 'white' }}>₹{emi} x {uMonths} Months</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>Provider Offer:</span>
                        <strong style={{ color: '#F59E0B' }}>{pMonths} Months FREE</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handlePayEMI(tour)}
                        className="btn-primary" 
                        style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', fontWeight: 'bold' }}
                      >
                        Pay EMI (₹{emi})
                      </button>
                      
                      {tour._metadata?.whatsappNumber && (
                        <a 
                          href={`https://wa.me/${tour._metadata.whatsappNumber}?text=${encodeURIComponent(`Hi, I want more details about the ${tour.title_name} EMI Plan.`)}`}
                          target="_blank" rel="noreferrer"
                          style={{ padding: '12px', background: '#25D366', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <MessageCircle size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Payment Modal with User Agreement */}
      {showPayment && selectedTour && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', overflowY: 'auto', padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--surface-bg)', borderRadius: '16px', padding: '24px', margin: 'auto' }}>
            <button 
              onClick={() => {
                setShowPayment(false);
                setAgreementAccepted(false);
              }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ color: '#10B981', margin: '0 0 16px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck /> User Agreement & Payment
            </h2>
            <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>{selectedTour.title_name}</h3>

            {!agreementAccepted ? (
              <div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', fontSize: '13px', color: 'var(--cool-gray)', lineHeight: 1.6, marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <strong>Tamil Nadu Tourism - Saving Plan Guidelines:</strong><br/><br/>
                  1. <strong>Commitment:</strong> The EMI amount (₹{selectedTour._metadata?.emiAmount}) is collected as an advance payment towards the specified tour package.<br/><br/>
                  2. <strong>Bonus Offer Validity:</strong> The bonus {selectedTour._metadata?.providerMonths} free EMIs provided by the Package Provider are strictly conditional. You must successfully complete all your required {selectedTour._metadata?.userMonths} monthly installments without default to avail the offer.<br/><br/>
                  3. <strong>Cancellations & Refunds:</strong> This scheme adheres to standard Tamil Nadu Tourism guidelines. Cancellations made mid-way through the EMI term are subject to strict processing deductions. Full refunds are not guaranteed without a valid documented reason.<br/><br/>
                  4. <strong>Liability:</strong> The Package Provider acts strictly as a facilitator for travel arrangements and is not liable for disruptions caused by unforeseen Acts of God, political mandates, or unpredicted weather conditions.<br/><br/>
                  By proceeding, you acknowledge that you have read and agree to these terms.
                </div>
                
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={agreementAccepted} 
                    onChange={e => setAgreementAccepted(e.target.checked)} 
                    style={{ marginTop: '4px', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>I agree to the Terms & Conditions and Tamil Nadu Tourism rules.</span>
                </label>

                <button 
                  className="btn-primary" 
                  disabled={!agreementAccepted}
                  onClick={() => setAgreementAccepted(true)}
                  style={{ width: '100%', padding: '12px', background: agreementAccepted ? '#10B981' : 'gray', cursor: agreementAccepted ? 'pointer' : 'not-allowed' }}
                >
                  Proceed to Pay ₹{selectedTour._metadata?.emiAmount}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} /> Terms Accepted Successfully
                </div>

                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', margin: '0 0 16px 0' }}>Amount to Pay: ₹{selectedTour._metadata?.emiAmount}</p>
                
                <PaymentQR amount={selectedTour._metadata?.emiAmount || 0} />
                
                <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px', marginTop: '16px' }}>Scan the QR code to pay your EMI, then enter your Transaction ID below.</p>
                
                <input 
                  type="text" 
                  placeholder="UPI Transaction ID" 
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '16px', marginBottom: '16px', width: '100%' }}
                />
                
                <button 
                  className="btn-primary" 
                  onClick={submitPayment}
                  disabled={submittingPayment || !paymentId.trim()}
                  style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}
                >
                  {submittingPayment ? 'Submitting...' : 'Submit EMI Payment'}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default TourO;
