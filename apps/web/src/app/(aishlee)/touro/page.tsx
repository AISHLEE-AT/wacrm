// @ts-nocheck
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { Compass, MessageCircle, Info, Check, ShieldCheck, X, MapPin, Map, Navigation, Star, TrendingUp, Search, Calendar, Plane } from 'lucide-react';
import { PaymentQR } from '@/aishlee/components/PaymentQR';
import { purchaseService } from '@/aishlee/services/purchaseService';

const TourO = () => {
  const router = useRouter();
  const { currentUser } = useApp();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const processedTours = useMemo(() => {
    return tours.map(tour => {
      let metadata = {};
      try {
        if (tour.additional_info) metadata = JSON.parse(tour.additional_info);
      } catch(e) {}
      return { ...tour, _metadata: metadata };
    });
  }, [tours]);

  const categories = ['All', ...new Set(processedTours.map(t => t.category || 'Other'))];

  const filteredTours = useMemo(() => {
    return processedTours.filter(tour => {
      const matchesSearch = tour.title_name?.toLowerCase().includes(searchQuery.toLowerCase()) || tour.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || tour.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [processedTours, searchQuery, selectedCategory]);


  const handlePayEMI = (tour) => {
    if (!currentUser) {
      alert("Please login first to join a tour plan.");
      router.push('/login');
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
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}>
      
      {/* 2026 AI Immersive Hero Section */}
      <div className="glass-panel hover-lift" style={{ 
        position: 'relative', overflow: 'hidden', padding: '40px 32px', borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(4, 120, 87, 0.1))',
        border: '1px solid rgba(20, 184, 166, 0.3)', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        {/* Glow effect behind */}
        <div style={{ position: 'absolute', top: '0', right: '0', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '8px', borderRadius: '12px', color: '#14B8A6' }}>
              <Plane size={24} />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Pilgrimage & EcoTourism</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1.1, color: '#fff' }}>
            Discover the world,<br/>
            <span className="gradient-text-teal">one destination at a time.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', maxWidth: '600px', lineHeight: 1.6 }}>
            Join our exclusive smart-saving schemes. Pay monthly EMIs and unlock bonus FREE EMIs sponsored by our partners.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--cool-gray)' }}>
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search destinations, tours..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', backdropFilter: 'blur(10px)', outline: 'none' }}
              />
            </div>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
              <button 
                onClick={() => router.push('/touro/admin')}
                style={{ background: 'var(--tech-cyan)', color: 'black', padding: '0 24px', borderRadius: '100px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={20} /> Manage Tours
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Filter Chips */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }} className="hide-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{ 
              padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap',
              background: selectedCategory === cat ? '#14B8A6' : 'rgba(255,255,255,0.05)',
              color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
              border: selectedCategory === cat ? '1px solid #14B8A6' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid Tours */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cool-gray)' }}>
          <Compass size={40} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#14B8A6' }} />
          Finding perfect destinations...
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--cool-gray)', borderRadius: '24px' }}>
          <Map size={60} opacity={0.3} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No tours found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredTours.map(tour => {
            const emi = tour._metadata?.emiAmount || 0;
            const uMonths = tour._metadata?.userMonths || 0;
            const pMonths = tour._metadata?.providerMonths || 0;
            
            return (
              <div key={tour.id} className="glass-panel hover-lift" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(20, 184, 166, 0.2)', background: 'linear-gradient(180deg, rgba(20, 184, 166, 0.05), transparent)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#14B8A6', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
                    {tour.category || 'General'}
                  </div>
                  {tour._metadata?.sub_category && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Navigation size={12} /> {tour._metadata.sub_category}
                    </span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '22px', margin: '0 0 12px 0', fontWeight: '800', color: '#fff', lineHeight: 1.3 }}>{tour.title_name}</h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, flex: 1, marginBottom: '24px' }}>{tour.description}</p>
                
                {/* 2026 Smart EMI Card */}
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14B8A6', marginBottom: '12px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <TrendingUp size={16} /> EMI Saving Plan
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You Pay</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>₹{emi} <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>x {uMonths} mo</span></div>
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '12px' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Provider Bonus</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Star size={16} fill="#F59E0B" /> {pMonths} Months FREE
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handlePayEMI(tour)}
                    style={{ flex: 1, padding: '16px', background: '#14B8A6', color: '#000', borderRadius: '100px', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(20, 184, 166, 0.4)' }}
                  >
                    Start EMI (₹{emi})
                  </button>
                  
                  {tour._metadata?.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${tour._metadata.whatsappNumber}?text=${encodeURIComponent(`Hi, I want more details about the ${tour.title_name} EMI Plan.`)}`}
                      target="_blank" rel="noreferrer"
                      style={{ width: '56px', background: 'rgba(255,255,255,0.05)', color: '#25D366', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                    >
                      <MessageCircle size={24} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal with User Agreement */}
      {showPayment && selectedTour && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', overflowY: 'auto', padding: '20px' }}>
          <div className="glass-panel animate-fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '500px', background: '#111', borderRadius: '32px', padding: '32px', margin: 'auto', border: '1px solid rgba(20, 184, 166, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => {
                setShowPayment(false);
                setAgreementAccepted(false);
              }}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: '#14B8A6', margin: '0 0 8px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
              <ShieldCheck size={28} /> Secure Payment
            </h2>
            <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '24px', fontWeight: '600', opacity: 0.9 }}>{selectedTour.title_name}</h3>

            {!agreementAccepted ? (
              <div>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '16px', maxHeight: '300px', overflowY: 'auto', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }} className="hide-scrollbar">
                  <strong style={{ color: '#fff' }}>Smart Saving Plan Guidelines:</strong><br/><br/>
                  1. <strong>Commitment:</strong> The EMI amount (₹{selectedTour._metadata?.emiAmount}) is collected as an advance payment towards the specified tour package.<br/><br/>
                  2. <strong>Bonus Offer Validity:</strong> The bonus {selectedTour._metadata?.providerMonths} free EMIs provided by the Package Provider are strictly conditional. You must successfully complete all your required {selectedTour._metadata?.userMonths} monthly installments without default to avail the offer.<br/><br/>
                  3. <strong>Cancellations & Refunds:</strong> Cancellations made mid-way through the EMI term are subject to strict processing deductions. Full refunds are not guaranteed without a valid documented reason.<br/><br/>
                  4. <strong>Liability:</strong> The Package Provider acts strictly as a facilitator for travel arrangements and is not liable for disruptions caused by unforeseen Acts of God, political mandates, or unpredicted weather conditions.<br/><br/>
                  By proceeding, you acknowledge that you have read and agree to these terms.
                </div>
                
                <label style={{ display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer', marginBottom: '32px', background: 'rgba(20, 184, 166, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                  <input 
                    type="checkbox" 
                    checked={agreementAccepted} 
                    onChange={e => setAgreementAccepted(e.target.checked)} 
                    style={{ width: '24px', height: '24px', accentColor: '#14B8A6' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>I agree to the Terms & Conditions.</span>
                </label>

                <button 
                  disabled={!agreementAccepted}
                  onClick={() => setAgreementAccepted(true)}
                  style={{ width: '100%', padding: '16px', background: agreementAccepted ? '#14B8A6' : 'rgba(255,255,255,0.1)', color: agreementAccepted ? '#000' : 'rgba(255,255,255,0.5)', cursor: agreementAccepted ? 'pointer' : 'not-allowed', borderRadius: '100px', fontWeight: 'bold', fontSize: '16px', border: 'none', transition: 'all 0.2s' }}
                >
                  Proceed to Pay ₹{selectedTour._metadata?.emiAmount}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6', padding: '12px', borderRadius: '100px', marginBottom: '24px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                  <Check size={18} /> Terms Accepted Successfully
                </div>

                <p style={{ color: 'white', fontWeight: '800', fontSize: '32px', margin: '0 0 24px 0' }}>₹{selectedTour._metadata?.emiAmount}</p>
                
                <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px' }}>
                  <PaymentQR amount={selectedTour._metadata?.emiAmount || 0} />
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>Scan the QR code with any UPI app to pay your EMI, then enter your Transaction ID below.</p>
                
                <input 
                  type="text" 
                  placeholder="Paste UPI Transaction ID here" 
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '16px', marginBottom: '24px', width: '100%', padding: '16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
                />
                
                <button 
                  onClick={submitPayment}
                  disabled={submittingPayment || !paymentId.trim()}
                  style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: (submittingPayment || !paymentId.trim()) ? 'rgba(255,255,255,0.1)' : '#14B8A6', color: (submittingPayment || !paymentId.trim()) ? 'rgba(255,255,255,0.5)' : '#000', borderRadius: '100px', border: 'none', cursor: (submittingPayment || !paymentId.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                >
                  {submittingPayment ? 'Submitting...' : 'Submit Payment'}
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
