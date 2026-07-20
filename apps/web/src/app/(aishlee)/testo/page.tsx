// @ts-nocheck
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { ClipboardCheck, Search, ChevronRight, ChevronDown, Lock, Play, MessageCircle, Folder, FolderOpen, X, Clock } from 'lucide-react';
import { PaymentQR } from '@/aishlee/components/PaymentQR';
import { purchaseService } from '@/aishlee/services/purchaseService';
import { lmsService } from '@/aishlee/services/lmsService';

const TestOHub = () => {
  const router = useRouter();
const navigate = (path) => router.push(path);
  const { currentUser } = useApp();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState<string>('');
  const [appliedCode, setAppliedCode] = useState<any>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  
  // Track purchased and pending tests
  const [purchasedTestIds, setPurchasedTestIds] = useState(new Set());
  const [pendingTestIds, setPendingTestIds] = useState(new Set());

  const [showPending, setShowPending] = useState(false);
  const [pendingTest, setPendingTest] = useState<any>(null);
  
  // Track backend test attempts
  const [testAttempts, setTestAttempts] = useState({});

  // UI state for folders and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderKey) => {
    setExpandedFolders(prev => ({...prev, [folderKey]: !prev[folderKey]}));
  };

  // Grouping logic
  const { groupedData, allTabs } = useMemo(() => {
    const data = {};
    const tabs = new Set();
    
    tests.forEach(test => {
      let metadata = {};
      try {
        if (test.additional_info) metadata = JSON.parse(test.additional_info);
      } catch(e) {}
      
      let cat = metadata.sub_category || 'General';
      let titleUpper = (test.title_name || '').toUpperCase();
      
      // Fallback: If category is General but title contains a known class/exam, try to extract it
      if (cat === 'General' || cat === 'Other') {
        const classMatch = titleUpper.match(/(1ST|2ND|3RD|4TH|5TH|6TH|7TH|8TH|9TH|10TH|11TH|12TH|LKG|UKG|TNPSC|UPSC|NDA|JEE|NEET)/);
        if (classMatch) {
          cat = classMatch[0];
          // Format correctly (e.g., 6TH -> 6th)
          if (cat.endsWith('TH') || cat.endsWith('ST') || cat.endsWith('ND') || cat.endsWith('RD')) {
            cat = cat.toLowerCase();
          }
        }
      }
      
      // Sub-category (Folder) is the Subject, which is before the colon
      let courseName = 'Other Subjects';
      if (test.title_name && test.title_name.includes(':')) {
        courseName = test.title_name.split(':')[0].trim();
      } else if (test.title_name && test.title_name.includes('-')) {
        courseName = test.title_name.split('-')[0].trim();
      }
      
      // Apply search filter
      if (searchQuery && !test.title_name?.toLowerCase().includes(searchQuery.toLowerCase()) && !test.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }
      
      tabs.add(cat);
      if (!data[cat]) data[cat] = {};
      if (!data[cat][courseName]) data[cat][courseName] = [];
      data[cat][courseName].push({...test, _metadata: metadata});
    });
    
    const sortedTabs = Array.from(tabs).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      
      return a.localeCompare(b);
    });
    
    return { groupedData: data, allTabs: sortedTabs };
  }, [tests, searchQuery]);

  useEffect(() => {
    if (allTabs.length > 0 && !allTabs.includes(activeTab) && !searchQuery) {
      setActiveTab(allTabs[0]);
    }
  }, [allTabs, activeTab, searchQuery]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all O-Tests
        const { data: testItems, error: testError } = await supabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'o_test')
          .order('created_at', { ascending: false });
          
        if (testError) throw testError;
        
        const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
        
        const processedTests = (testItems || []).map(test => {
           let isComplete = false;
           try {
              let info = test.additional_info || test.metadata || {};
              if (typeof info === 'string') {
                 info = JSON.parse(info);
              }
              if (typeof info === 'string') {
                 info = JSON.parse(info);
              }
              let qs = [];
              if (Array.isArray(info)) {
                 qs = info;
              } else if (info.questions && Array.isArray(info.questions)) {
                 qs = info.questions;
              } else if (info.data && Array.isArray(info.data)) {
                 qs = info.data;
              }
              if (qs.length > 0 || info.type === 'AI_GENERATED') {
                 isComplete = true;
              }
           } catch(e) {}
           return { ...test, isComplete };
        });
        
        if (isAdmin) {
           setTests(processedTests);
        } else {
           setTests(processedTests.filter(t => t.isComplete));
        }

        // Fetch user's purchases to see which tests are unlocked
        if (currentUser) {
          const { data: purchases, error: purError } = await supabase
            .from('purchases')
            .select('item_id, status')
            .eq('user_id', currentUser.id)
            .eq('item_type', 'o_test'); // filter by test just to be safe
            
          if (!purError && purchases) {
            const approvedSet = new Set(purchases.filter(p => ['APPROVED', 'completed', 'approved'].includes(p.status)).map(p => p.item_id));
            const pendingSet = new Set(purchases.filter(p => p.status === 'PENDING').map(p => p.item_id));
            setPurchasedTestIds(approvedSet);
            setPendingTestIds(pendingSet);
          }

          // Fetch test attempts
          const { data: attemptsData } = await supabase
            .from('user_test_attempts')
            .select('test_id, attempts')
            .eq('user_id', currentUser.id);
            
          if (attemptsData) {
            const attemptMap = {};
            attemptsData.forEach(a => {
              attemptMap[a.test_id] = a.attempts;
            });
            setTestAttempts(attemptMap);
          }
        }
      } catch (err: any) {
        console.error("Error fetching O-Tests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleTestClick = (test) => {
    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
    const attempts = testAttempts[test.id] || 0;
    const maxAttempts = 2;
    
    // If admin, super admin, or already purchased, allow access
    if (isAdmin || purchasedTestIds.has(test.id)) {
      if (!isAdmin && attempts >= maxAttempts) {
        setSelectedTest({...test, isRepurchase: true});
        setShowPayment(true);
        setAccessCodeInput('');
        setAppliedCode(null);
        setAppliedDiscount(0);
        return;
      }
      navigate(`/testo/exam/${test.id}`);
    } else if (pendingTestIds.has(test.id)) {
      setPendingTest(test);
      setShowPending(true);
    } else {
      setSelectedTest({...test, isRepurchase: false});
      setShowPayment(true);
      setAccessCodeInput('');
      setAppliedCode(null);
      setAppliedDiscount(0);
    }
  };

  const handlePaymentSuccess = async () => {
    // Optimistically update pending status since they just submitted
    setPendingTestIds(prev => new Set(prev).add(selectedTest.id));
    setShowPayment(false);
    setPendingTest(selectedTest);
    setShowPending(true);
  };

  const submitPayment = async () => {
    const finalAmount = Math.max(0, (selectedTest?.price || 33) - appliedDiscount);
    
    // If there is an amount to pay, payment ID is required unless fully discounted
    if (finalAmount > 0 && !paymentId.trim()) {
      alert("Please enter the Payment ID (Transaction Reference).");
      return;
    }
    setSubmittingPayment(true);
    try {
      const bName = currentUser.fullName || currentUser.full_name || currentUser.user_metadata?.full_name || 'User';
      const bContact = currentUser.whatsapp || '';
      
      await purchaseService.submitPurchase(
        currentUser.id, 
        selectedTest.id, 
        'o_test', 
        appliedCode ? `CODE:${appliedCode}` : paymentId.trim(), 
        bName, 
        bContact
      );

      // If this was a repurchase, reset their attempts to 0 so they can take it once approved
      if (selectedTest.isRepurchase) {
        await supabase.from('user_test_attempts').upsert({
          user_id: currentUser.id,
          test_id: selectedTest.id,
          attempts: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, test_id' });
        setTestAttempts(prev => ({...prev, [selectedTest.id]: 0}));
      }
      
      setPendingTestIds(prev => new Set(prev).add(selectedTest.id));
      setShowPayment(false);
      setPaymentId('');
      setPendingTest(selectedTest);
      setShowPending(true);
    } catch (e) {
      alert("Failed to submit payment. Please try again.");
    }
    setSubmittingPayment(false);
  };

  return (
    <div className="animate-fade-in-up bento-grid">
      
      {/* Header Bento Item */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--surface-3)', padding: '12px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
            <ClipboardCheck color="#EF4444" size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', margin: 0, fontWeight: '900', color: 'white' }}>O-Test Hub</h1>
            <p style={{ fontSize: '14px', color: 'var(--cool-gray)', margin: 0 }}>Secure Online Testing Platform</p>
          </div>
        </div>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
          <button 
            onClick={() => navigate('/testo/admin')}
            className="btn-primary hover-glow"
            style={{ padding: '10px 20px', fontSize: '14px', background: 'var(--tech-cyan)', color: 'black' }}
          >
            Create / Manage Tests
          </button>
        )}
      </div>

      <div className="bento-item span-12 glass-panel" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.1))', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: 'bold', color: '#60a5fa' }}>Level Up Your Prep!</h2>
        <p style={{ fontSize: '15px', color: 'var(--cool-gray)', margin: 0, lineHeight: 1.6 }}>
          Take micro-topic tests carefully crafted for school exams, IBPS, and other competitive exams. Master every topic for just <strong style={{ color: 'var(--tech-gold)' }}>Rs. 33</strong> per test.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} color="var(--tech-cyan)" style={{ marginLeft: '12px' }} />
        <input 
          type="text" 
          placeholder="Search tests by topic or course..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: 'white', outline: 'none', padding: '8px' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cool-gray)' }}>Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--cool-gray)' }}>
          <ClipboardCheck size={48} opacity={0.5} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No O-Tests available yet. Check back soon!
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cool-gray)' }}>No tests found for your search.</div>
      ) : (
        <>
          {/* Tabs */}
          {!searchQuery && (
            <div className="bento-item span-12 glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }} className="hide-scrollbar">
                <span style={{ fontWeight: "bold", color: "var(--cool-gray)", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
                  Categories:
                </span>
                {allTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`chip ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Folder Content */}
          <div className="span-12" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(searchQuery ? allTabs : [activeTab]).map(currentTab => {
              const courses = groupedData[currentTab] || {};
              return Object.keys(courses).sort().map(courseName => {
                const folderKey = `${currentTab}_${courseName}`;
                const isExpanded = searchQuery ? true : expandedFolders[folderKey];
                const courseTests = courses[courseName];
                
                return (
                  <div key={folderKey} className="bento-item span-12 glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Folder Header */}
                    <div 
                      onClick={() => toggleFolder(folderKey)}
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)',
                        borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isExpanded ? <FolderOpen size={24} color="#60a5fa" /> : <Folder size={24} color="#60a5fa" />}
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{courseName}</h3>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--cool-gray)' }}>{courseTests.length} Tests</p>
                        </div>
                      </div>
                      <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <ChevronDown size={20} color="var(--cool-gray)" />
                      </div>
                    </div>
                    
                    {/* Tests List */}
                    {isExpanded && (
                      <div style={{ display: 'grid', gap: '1px', background: 'rgba(255,255,255,0.02)' }}>
                        {courseTests.map(test => {
                          const isUnlocked = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || purchasedTestIds.has(test.id);
                          const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
                          const attempts = testAttempts[test.id] || 0;
                          const maxAttempts = 2;
                          const isLockedOut = !isAdmin && attempts >= maxAttempts;
                          
                          let shortTitle = test.title_name;
                          if (shortTitle.includes(':')) {
                              shortTitle = shortTitle.split(':')[1].trim();
                          }
                          
                          return (
                            <div 
                              key={test.id} 
                              onClick={() => handleTestClick(test)}
                              style={{ 
                                padding: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: isLockedOut ? 'not-allowed' : 'pointer',
                                background: '#111827',
                                transition: 'all 0.2s ease',
                                borderLeft: `3px solid ${isUnlocked && !isLockedOut ? '#10B981' : isLockedOut ? '#EF4444' : 'transparent'}`
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                                  <h4 style={{ margin: 0, fontSize: '15px', color: isUnlocked && !isLockedOut ? '#10B981' : isLockedOut ? '#EF4444' : 'white' }}>
                                    {shortTitle || 'Untitled Test'}
                                  </h4>
                                  {currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' ? (
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: test.isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      color: test.isComplete ? '#10B981' : '#EF4444',
                                      border: `1px solid ${test.isComplete ? '#10B981' : '#EF4444'}`,
                                      fontWeight: 'bold'
                                    }}>
                                      {test.isComplete ? 'COMPLETE' : 'INCOMPLETE'}
                                    </span>
                                  ) : null}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {!isUnlocked && !pendingTestIds.has(test.id) && (
                                    <span style={{ fontSize: '13px', color: '#F97316', fontWeight: 'bold' }}>
                                      Rs. 33
                                    </span>
                                  )}
                                  {isUnlocked && !isAdmin && (
                                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: isLockedOut ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: isLockedOut ? '#EF4444' : 'var(--cool-gray)' }}>
                                      {isLockedOut ? 'Repurchase Needed' : `Attempts: ${attempts} / ${maxAttempts}`}
                                    </span>
                                  )}
                                  {pendingTestIds.has(test.id) && (
                                    <span style={{ fontSize: '12px', color: '#F59E0B' }}>Pending Approval</span>
                                  )}
                                </div>
                              </div>
                              
                              <div style={{ 
                                background: (isUnlocked && !isLockedOut) ? 'rgba(16, 185, 129, 0.1)' : isLockedOut ? 'rgba(239, 68, 68, 0.1)' : pendingTestIds.has(test.id) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                width: '36px', height: '36px', 
                                borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                              }}>
                                {isUnlocked && !isLockedOut ? <Play size={16} color="#10B981" /> : isLockedOut ? <Lock size={16} color="#EF4444" /> : pendingTestIds.has(test.id) ? <Clock size={16} color="#F59E0B" /> : <Lock size={16} color="var(--cool-gray)" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </>
      )}


      {/* Payment Modal */}
      {showPayment && selectedTest && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ position: 'relative', width: '90%', maxWidth: '400px', background: 'var(--surface-bg)', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center' }}>
            <button 
              onClick={() => {
                setShowPayment(false);
                setPaymentId('');
              }}
              className="btn-outline hover-glow"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: 'var(--tech-cyan)', margin: '0 0 8px 0', fontSize: '22px' }}>{selectedTest.isRepurchase ? 'Repurchase O-Test' : 'Unlock O-Test'}</h2>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', margin: '0 0 16px 0', lineHeight: '1.4' }}>{selectedTest.title_name || 'Untitled Test'}</p>
            
            {appliedDiscount > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--cool-gray)', fontSize: '18px', textDecoration: 'line-through', margin: '0' }}>₹{selectedTest.price || 33}</p>
                <p style={{ color: 'var(--tech-gold)', fontSize: '24px', fontWeight: '900', margin: '0' }}>
                  ₹{Math.max(0, (selectedTest.price || 33) - appliedDiscount)}
                </p>
                <p style={{ color: 'var(--tech-cyan)', fontSize: '14px', margin: '4px 0 0 0' }}>✓ Access Code Applied!</p>
              </div>
            ) : (
              <p style={{ color: 'var(--tech-gold)', fontSize: '24px', fontWeight: '900', margin: '0 0 24px 0' }}>₹{selectedTest.price || 33}</p>
            )}
            
            {((selectedTest.price || 33) - appliedDiscount) > 0 && (
              <>
                <PaymentQR 
                  amount={Math.max(0, (selectedTest.price || 33) - appliedDiscount)} 
                  onSuccess={handlePaymentSuccess}
                  itemId={selectedTest.id}
                />
                
                <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px', marginTop: '16px' }}>Scan QR to pay securely, then enter your Payment Transaction ID below.</p>
                
                <input 
                  type="text" 
                  placeholder="UPI Transaction ID" 
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '16px', marginBottom: '16px', width: '100%' }}
                />
              </>
            )}

            {!appliedCode && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Have an Access Code?" 
                  value={accessCodeInput}
                  onChange={e => setAccessCodeInput(e.target.value)}
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '14px', flex: 1 }}
                />
                <button
                  className="btn-outline"
                  disabled={!accessCodeInput || submittingPayment}
                  onClick={async () => {
                    setSubmittingPayment(true);
                    try {
                      const inputVal = accessCodeInput.trim().toUpperCase();
                      if (inputVal.startsWith('PAID-')) {
                        const isValid = await lmsService.validateAndConsumeCode(inputVal);
                        if (isValid) {
                          const bName = currentUser?.name || 'User';
                          const bContact = currentUser?.email || 'No Email';
                          await purchaseService.submitPurchase(currentUser.id, selectedTest.id, 'Test', inputVal, bName, bContact, 'APPROVED');
                          alert("Access Code Applied successfully! Test unlocked instantly.");
                          setSelectedTest(null);
                          setAccessCodeInput('');
                        } else {
                          alert("Invalid or Already Used Access Code.");
                        }
                      } else {
                        alert("Invalid Access Code format. Must start with PAID-");
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    setSubmittingPayment(false);
                  }}
                  style={{ padding: '8px 12px', fontSize: '14px' }}
                >
                  Apply
                </button>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={submitPayment}
              disabled={submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}
            >
              {submittingPayment ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Floating WhatsApp Contact */}
      <a 
        href={`https://wa.me/916381029380?text=${encodeURIComponent(selectedTest ? `Hello Admin, I just paid for the O-Test: "${selectedTest.title_name || 'Untitled'}". Please approve my transaction.` : "Hello Admin, I need help regarding O-Tests.")}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#25D366',
          color: 'white',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          zIndex: 100
        }}
      >
        <MessageCircle size={28} />
      </a>

      {/* Pending Approval Modal */}
      {showPending && pendingTest && createPortal(
        <div className="mobile-fullscreen-modal animate-fade-in" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
          <div className="mobile-modal-content" style={{ width: '90%', maxWidth: '400px', background: '#1f2937', height: 'auto', padding: '24px', textAlign: 'center', borderRadius: '16px', position: 'relative' }}>
            <ClipboardCheck size={48} color="#F59E0B" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '20px', margin: '0 0 12px 0' }}>Waiting for Approval</h2>
            <p style={{ color: 'var(--cool-gray)', marginBottom: '24px', fontSize: '14px' }}>
              Your payment for <strong>{pendingTest.title_name}</strong> has been submitted and is currently pending admin approval.
            </p>
            <p style={{ color: 'var(--cool-gray)', marginBottom: '24px', fontSize: '14px' }}>
              Please contact our admin on WhatsApp and send a <strong>screenshot of your payment</strong> for faster activation.
            </p>
            
            <a 
              href={`https://wa.me/916381029380?text=${encodeURIComponent(`Hi Admin, I have made the payment for O-Test: ${pendingTest.title_name}. Please approve my access. My Name: ${currentUser?.fullName || currentUser?.full_name || currentUser?.email}`)}`}
              target="_blank" rel="noreferrer"
              className="btn-primary"
              style={{ width: '100%', marginBottom: '12px', background: '#25D366', color: 'white', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MessageCircle size={20} style={{ marginRight: '8px' }} />
              Contact Admin via WhatsApp
            </a>
            
            <button 
              onClick={() => setShowPending(false)}
              className="btn-outline"
              style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TestOHub;
