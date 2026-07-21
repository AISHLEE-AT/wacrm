// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IndianRupee, FileText, CheckCircle, Clock, Info, ShieldAlert, ArrowRight, Loader, Landmark, ShieldCheck, Download, MessageCircle, X, Coins, Building, Car, Award, Tractor, Home, Users, Briefcase, PiggyBank } from 'lucide-react';
import { useApp } from '@/aishlee/context/AppProvider';
import { dataService } from '@/aishlee/services/dataService';
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { LOAN_PRODUCTS, TN_LEGAL_TERMS, generatePromissoryNoteText, GOVT_BUSINESS_SCHEMES, TN_SAVINGS_TERMS, generateSavingsAgreementText } from '@/aishlee/constants/loanTerms';
import { jsPDF } from 'jspdf';
import { PaymentQR } from '@/aishlee/components/PaymentQR';

const MoneyO = () => {
  const { currentUser } = useApp();
  
  const [loans, setLoans] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeProduct, setActiveProduct] = useState(null);
  const [step, setStep] = useState(0); // 0 = Closed, 1 = Form, 2 = Terms, 3 = Success/Payment
  const [modalType, setModalType] = useState('secured'); // 'secured', 'govt', 'savings'
  
  // Application Form State
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [assetDetails, setAssetDetails] = useState('');
  const [name, setName] = useState(currentUser?.fullName || '');
  const [education, setEducation] = useState('');
  const [idea, setIdea] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch loans
      const loanData = await dataService.fetchMasterData('LOAN', currentUser);
      setLoans(loanData);

      // Fetch savings
      const { data: savingData } = await supabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'saving_scheme');
      setSavings(savingData || []);

    } catch (err) {
      console.error("Failed to load MoneyO data", err);
    } finally {
      setLoading(false);
    }
  };

  const IconMap = {
    'Coins': Coins,
    'Building': Building,
    'Car': Car,
    'Award': Award,
    'Tractor': Tractor,
    'Home': Home,
    'Users': Users,
    'Briefcase': Briefcase,
    'Landmark': Landmark,
    'PiggyBank': PiggyBank
  };

  const handleOpenProduct = (product, type = 'secured') => {
    setActiveProduct(product);
    setModalType(type);
    setStep(1);
    setAmount(type === 'savings' ? (JSON.parse(product.additional_info || '{}').price || product.price || '') : '');
    setPurpose('');
    setAssetDetails('');
    setName(currentUser?.fullName || '');
    setEducation('');
    setIdea('');
  };

  const handleClose = () => {
    setActiveProduct(null);
    setStep(0);
  };

  const handleAcceptTerms = () => {
    // Generate PDF
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    if (modalType === 'savings') {
      let providerName = "Aishlee Finance";
      let emiAmount = activeProduct.price;
      try {
        const info = JSON.parse(activeProduct.additional_info || '{}');
        if (info.provider) providerName = info.provider;
        if (info.price) emiAmount = info.price;
      } catch(e) {}

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("MONTHLY SAVINGS SCHEME AGREEMENT", 105, 20, null, null, "center");
      
      // Body Text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const textLines = doc.splitTextToSize(generateSavingsAgreementText(currentUser?.fullName || 'User', emiAmount, activeProduct.title_name || activeProduct.title, providerName, date), 170);
      doc.text(textLines, 20, 40);

      // Terms
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TERMS AND CONDITIONS", 105, 20, null, null, "center");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const termsLines = doc.splitTextToSize(TN_SAVINGS_TERMS, 170);
      doc.text(termsLines, 20, 30);

      doc.save(`Savings_Agreement_${(activeProduct.title_name || activeProduct.title).replace(/ /g, '_')}.pdf`);
      
    } else {
      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("PROMISSORY NOTE & LOAN AGREEMENT", 105, 20, null, null, "center");
      
      // Body Text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const textLines = doc.splitTextToSize(generatePromissoryNoteText(currentUser?.fullName || 'User', amount, activeProduct.title || activeProduct.title_name, date), 170);
      doc.text(textLines, 20, 40);

      // Terms
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TERMS AND CONDITIONS", 105, 20, null, null, "center");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const termsLines = doc.splitTextToSize(TN_LEGAL_TERMS, 170);
      doc.text(termsLines, 20, 30);

      doc.save(`Loan_Agreement_${(activeProduct.title || activeProduct.title_name).replace(/ /g, '_')}.pdf`);
    }
    
    // Move to success/payment step
    setStep(3);
  };

  const handleWhatsApp = () => {
    const targetPhone = activeProduct.whatsappNumber || "919486335870"; 
    let text = "";

    if (modalType === 'savings') {
      const info = JSON.parse(activeProduct.additional_info || '{}');
      const emiAmount = info.price || activeProduct.price;
      text = `Hi Admin, I have enrolled in the ${activeProduct.title_name} scheme and paid my first EMI of ₹${emiAmount} via QR. I have downloaded the Savings Agreement. My name is ${currentUser?.fullName || 'User'}.`;
    } else {
      text = `Hi Admin, I have accepted the terms for a ${activeProduct.title || activeProduct.title_name} of ₹${amount}. I have downloaded the generated PDF agreement. When can I visit for the physical asset appraisal? My name is ${currentUser?.fullName || 'User'}.`;
    }

    window.open(`https://wa.me/${(String(targetPhone).replace(/\D/g, '').length === 10 ? '91' + String(targetPhone).replace(/\D/g, '') : String(targetPhone).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWhatsAppGovt = () => {
    const targetPhone = activeProduct.whatsappNumber || "919486335870"; 
    const text = `Hi Admin, I am interested in the ${activeProduct.title || activeProduct.title_name}. Name: ${name}, Education: ${education}, Business Idea: ${idea}, Est. Capital: ₹${amount}. Please provide A-to-Z guidance on starting this business and processing the loan.`;
    window.open(`https://wa.me/${(String(targetPhone).replace(/\D/g, '').length === 10 ? '91' + String(targetPhone).replace(/\D/g, '') : String(targetPhone).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`, '_blank');
    handleClose();
  };

  const displayLoans = (loans && loans.length > 0) ? loans.map(sl => ({
    id: sl.id || sl.title || Math.random().toString(),
    title: sl.title || sl.title_name || 'Unknown Loan',
    desc: sl.description || sl.content || 'Details available upon request.',
    maxAmount: sl.price || sl.amount ? `₹${sl.price || sl.amount}` : 'Variable',
    color: sl.color || '#F59E0B',
    icon: sl.icon || 'Award',
    whatsappNumber: sl.whatsapp_number || sl.whatsappNumber
  })) : LOAN_PRODUCTS;

  return (
    <div className="animate-fade-in-up bento-grid">
      
      {/* HEADER */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--surface-3)', padding: '12px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
            <Landmark color="var(--tech-gold)" size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', margin: 0, fontWeight: '900', color: 'white' }}>Aishlee Finance & Support</h1>
            <p className="text-muted" style={{ fontSize: '14px', margin: '4px 0 0 0', color: 'var(--cool-gray)' }}>Comprehensive support for Secured Lending, Savings & Government Schemes.</p>
          </div>
        </div>
      </div>

      {/* MONTHLY SAVINGS SCHEMES */}
      <div className="bento-item span-12">
        <h3 style={{ fontSize: '20px', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiggyBank color="#10B981" size={24} /> Monthly Savings Schemes (11 + 1 Bonus)
        </h3>
        {loading ? (
          <div style={{ color: 'var(--cool-gray)', textAlign: 'center', padding: '40px' }}>Loading saving schemes...</div>
        ) : savings.length === 0 ? (
          <div style={{ color: 'var(--cool-gray)' }}>No savings schemes found. Please ask admin to seed data.</div>
        ) : (
          <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {savings.map(scheme => {
              let info = {};
              try { info = JSON.parse(scheme.additional_info || '{}'); } catch(e) {}
              const IconComponent = IconMap[info.icon] || PiggyBank;
              const color = info.color || '#10B981';
              const emi = info.price || scheme.amount || scheme.price || 0;
              
              return (
                <div key={scheme.id} className="glass-panel hover-lift" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `4px solid ${color}` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', background: `${color}20` }}>
                        <IconComponent color={color} size={24} />
                      </div>
                      <h4 style={{ fontSize: '16px', color: 'white', margin: 0, lineHeight: 1.3 }}>{scheme.title_name}</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--cool-gray)', margin: '0 0 12px 0', lineHeight: '1.5' }}>{scheme.description}</p>
                    
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>You Pay (11m):</span> <span>₹{emi * 11}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Provider Bonus (1m):</span> <span style={{ color: '#10B981' }}>+ ₹{emi}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px', fontWeight: 'bold' }}>
                        <span>13th Month Maturity:</span> <span style={{ color: color }}>₹{emi * 12}</span>
                      </div>
                      {info.provider && (
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--cool-gray)' }}>
                           <span>Provider:</span> <span>{info.provider}</span>
                         </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleOpenProduct(scheme, 'savings')}
                      className="btn-primary" 
                      style={{ background: color, color: 'black', width: '100%', padding: '8px', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      Enrol Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LOAN PRODUCTS GRID */}
      <div className="bento-item span-12" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '20px', color: 'white', marginBottom: '16px' }}>Secured Lending Products</h3>
        {loading ? (
          <div style={{ color: 'var(--cool-gray)', textAlign: 'center', padding: '40px' }}>Loading loan products...</div>
        ) : (
          <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {displayLoans.map(product => {
              const IconComponent = IconMap[product.icon] || Landmark;
              return (
              <div key={product.id} className="glass-panel hover-lift" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `4px solid ${product.color}` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: `${product.color}20` }}>
                      <IconComponent color={product.color} size={24} />
                    </div>
                    <h4 style={{ fontSize: '18px', color: 'white', margin: 0 }}>{product.title}</h4>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--cool-gray)', margin: 0, lineHeight: '1.5' }}>{product.desc}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: product.color, fontWeight: 'bold' }}>Max: {product.maxAmount}</span>
                  <button 
                    onClick={() => handleOpenProduct(product, 'secured')}
                    className="btn-primary" 
                    style={{ background: product.color, color: 'black', padding: '6px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Apply <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {step > 0 && activeProduct && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative', background: '#0f172a', border: `2px solid ${activeProduct.color || '#10B981'}` }}>
            
            <button onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--cool-gray)', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            {/* STEP 1: APPLICATION FORM FOR SAVINGS */}
            {step === 1 && modalType === 'savings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <h2 style={{ fontSize: '24px', color: '#10B981', margin: '0 0 8px 0' }}>Enrol: {activeProduct.title_name}</h2>
                  <p style={{ color: 'var(--cool-gray)', margin: 0 }}>Review your scheme details before proceeding.</p>
                </div>
                
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: '12px', padding: '16px', color: '#e2e8f0', fontSize: '14px' }}>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Monthly EMI:</strong> ₹{amount}</li>
                    <li><strong>Duration:</strong> You pay for 11 months</li>
                    <li><strong>Provider Bonus:</strong> Provider adds ₹{amount} (1 month equivalent)</li>
                    <li><strong>Total Maturity:</strong> ₹{amount * 12} payout on 13th month</li>
                    <li><strong>Provider:</strong> {JSON.parse(activeProduct.additional_info || '{}').provider || 'Aishlee Finance'}</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#FCA5A5', display: 'flex', gap: '10px' }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>Tamil Nadu Nidhi rules mandate KYC (Aadhaar & PAN) submission before the second EMI. Pre-mature withdrawal incurs penalties.</span>
                </div>

                <button 
                  onClick={() => setStep(2)} 
                  className="btn-primary" 
                  style={{ background: '#10B981', color: 'black', width: '100%', padding: '12px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}
                >
                  Review Terms & Conditions
                </button>
              </div>
            )}

            {/* STEP 1: APPLICATION FORM FOR SECURED LOANS */}
            {step === 1 && modalType === 'secured' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <h2 style={{ fontSize: '24px', color: activeProduct.color, margin: '0 0 8px 0' }}>{activeProduct.title} Application</h2>
                  <p style={{ color: 'var(--cool-gray)', margin: 0 }}>Please provide details for physical appraisal.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--cool-gray)' }}>Requested Amount (₹)</label>
                    <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--cool-gray)' }}>Purpose of Loan</label>
                    <input type="text" className="input-field" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Business Expansion, Medical" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--cool-gray)' }}>Asset Details for Appraisal</label>
                    <textarea 
                      className="input-field" 
                      rows="3" 
                      value={assetDetails} 
                      onChange={e => setAssetDetails(e.target.value)} 
                      placeholder="Enter asset details for appraisal..." 
                      style={{ resize: 'none' }} 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)} 
                  disabled={!amount || !purpose || !assetDetails}
                  className="btn-primary" 
                  style={{ background: activeProduct.color, color: 'black', width: '100%', padding: '12px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}
                >
                  Review Terms & Conditions
                </button>
              </div>
            )}

            {/* STEP 2: TERMS AND CONDITIONS */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <ShieldCheck size={48} color={modalType === 'savings' ? '#10B981' : activeProduct.color} style={{ margin: '0 auto 12px auto' }} />
                  <h2 style={{ fontSize: '22px', color: 'white', margin: '0 0 8px 0' }}>Legal Terms & Conditions</h2>
                  <p style={{ color: 'var(--cool-gray)', margin: 0 }}>Please read carefully before generating the agreement.</p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--surface-border)', maxHeight: '300px', overflowY: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>
                    {modalType === 'savings' ? TN_SAVINGS_TERMS : TN_LEGAL_TERMS}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1, padding: '12px' }}>
                    Go Back
                  </button>
                  <button onClick={handleAcceptTerms} className="btn-primary" style={{ flex: 2, background: modalType === 'savings' ? '#10B981' : activeProduct.color, color: 'black', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <FileText size={18} /> I Accept & Generate PDF
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS & PAYMENT / WHATSAPP */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={64} color="#10B981" style={{ marginBottom: '10px' }} />
                <h2 style={{ fontSize: '24px', color: 'white', margin: 0 }}>Agreement Generated!</h2>
                <p style={{ color: 'var(--cool-gray)', margin: 0, lineHeight: '1.5' }}>
                  Your {modalType === 'savings' ? 'Savings Scheme Agreement' : 'Promissory Note'} PDF has been downloaded.
                </p>

                {modalType === 'savings' ? (
                  <div style={{ width: '100%', marginTop: '16px' }}>
                    <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '16px' }}>Scan to pay your 1st EMI of ₹{JSON.parse(activeProduct.additional_info || '{}').price || activeProduct.price} to activate your scheme.</p>
                    <PaymentQR 
                      amount={JSON.parse(activeProduct.additional_info || '{}').price || activeProduct.price} 
                      purpose={`${activeProduct.title_name} - 1st EMI`} 
                    />
                    <div style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '12px', padding: '16px', width: '100%', marginTop: '16px' }}>
                      <h3 style={{ fontSize: '14px', color: 'white', margin: '0 0 12px 0' }}>After Payment:</h3>
                      <button onClick={handleWhatsApp} className="btn-primary" style={{ background: '#25D366', color: 'white', width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} /> Send Screenshot to Admin
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '12px', padding: '24px', width: '100%', marginTop: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '16px' }}>Next Step: Schedule Appraisal</h3>
                    <p style={{ fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '16px' }}>Please sign the downloaded PDF and bring it along with your physical asset for appraisal.</p>
                    <button onClick={handleWhatsApp} className="btn-primary" style={{ background: '#25D366', color: 'white', width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <MessageCircle size={20} /> Message Admin on WhatsApp
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default MoneyO;
