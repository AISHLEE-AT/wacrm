// @ts-nocheck
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { ClipboardCheck, Search, ChevronRight, ChevronDown, Lock, Play, MessageCircle, Folder, FolderOpen, X, Clock, Brain, Target, Zap, ShieldCheck } from 'lucide-react';
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

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

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
      showToast("Please enter the Payment ID (Transaction Reference).", 'error');
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
      showToast("Failed to submit payment. Please try again.", 'error');
    }
    setSubmittingPayment(false);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}>
      
      {/* 2026 AI Analytics Hero Section */}
      <div className="glass-panel hover-lift" style={{ 
        position: 'relative', overflow: 'hidden', padding: '60px 40px', borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.1))',
        border: '1px solid rgba(239, 68, 68, 0.3)', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        {/* Glow effect behind */}
        <div style={{ position: 'absolute', top: '0', right: '0', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '12px', color: '#EF4444' }}>
              <Target size={24} />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>AI-Powered Assessment</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1.1, color: '#fff' }}>
            Test your knowledge,<br/>
            <span className="gradient-text-red">accelerate your success.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', maxWidth: '600px', lineHeight: 1.6 }}>
            Micro-topic tests carefully crafted for school and competitive exams. Analyze performance and improve weak spots.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--cool-gray)' }}>
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search topics, subjects, exams..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', backdropFilter: 'blur(10px)', outline: 'none' }}
              />
            </div>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
              <button 
                onClick={() => router.push('/testo/admin')}
                style={{ background: '#EF4444', color: '#fff', padding: '0 24px', borderRadius: '100px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
              >
                <ClipboardCheck size={20} /> Manage Tests
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cool-gray)' }}>
          <Zap size={40} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#EF4444' }} />
          Loading assessments...
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--cool-gray)', borderRadius: '24px' }}>
          <ClipboardCheck size={60} opacity={0.3} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No assessments available yet.
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cool-gray)' }}>No tests found for your search.</div>
      ) : (
        <>
          {/* Smart Filter Chips */}
          {!searchQuery && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }} className="hide-scrollbar">
              {allTabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap',
                    background: activeTab === tab ? '#EF4444' : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                    border: activeTab === tab ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Folder Content - 2026 Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {(searchQuery ? allTabs : [activeTab]).map(currentTab => {
              const courses = groupedData[currentTab] || {};
              return Object.keys(courses).sort().map(courseName => {
                const folderKey = `${currentTab}_${courseName}`;
                const isExpanded = searchQuery ? true : expandedFolders[folderKey];
                const courseTests = courses[courseName];
                
                return (
                  <div key={folderKey} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                    {/* Folder Header */}
                    <div 
                      onClick={() => toggleFolder(folderKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: isExpanded ? '20px' : '0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '16px', color: '#EF4444' }}>
                           {isExpanded ? <FolderOpen size={24} /> : <Folder size={24} />}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#fff' }}>{courseName}</h3>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{courseTests.length} Assessments</p>
                        </div>
                      </div>
                      <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '8px' }}>
                        <ChevronDown size={20} color="white" />
                      </div>
                    </div>
                    
                    {/* Tests List */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '16px',
                                border: `1px solid ${isUnlocked && !isLockedOut ? 'rgba(16, 185, 129, 0.3)' : isLockedOut ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: isUnlocked && !isLockedOut ? '#10B981' : isLockedOut ? '#EF4444' : 'white' }}>
                                    {shortTitle || 'Untitled Test'}
                                  </h4>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {!isUnlocked && !pendingTestIds.has(test.id) && (
                                    <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>
                                      ₹{test.price || 33}
                                    </span>
                                  )}
                                  {isUnlocked && !isAdmin && (
                                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: isLockedOut ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: isLockedOut ? '#EF4444' : 'var(--text-secondary)' }}>
                                      {isLockedOut ? 'Repurchase Needed' : `Attempts: ${attempts}/${maxAttempts}`}
                                    </span>
                                  )}
                                  {pendingTestIds.has(test.id) && (
                                    <span style={{ fontSize: '11px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>Pending</span>
                                  )}
                                </div>
                              </div>
                              
                              <div style={{ 
                                background: (isUnlocked && !isLockedOut) ? 'rgba(16, 185, 129, 0.2)' : isLockedOut ? 'rgba(239, 68, 68, 0.2)' : pendingTestIds.has(test.id) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                                width: '40px', height: '40px', 
                                borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                              }}>
                                {isUnlocked && !isLockedOut ? <Play size={18} color="#10B981" /> : isLockedOut ? <Lock size={18} color="#EF4444" /> : pendingTestIds.has(test.id) ? <Clock size={18} color="#F59E0B" /> : <Lock size={18} color="var(--cool-gray)" />}
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '400px', background: '#111', borderRadius: '32px', padding: '32px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <button 
              onClick={() => {
                setShowPayment(false);
                setPaymentId('');
              }}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: '#EF4444', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldCheck size={28} /> {selectedTest.isRepurchase ? 'Repurchase' : 'Unlock Assessment'}
            </h2>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '18px', margin: '0 0 24px 0', opacity: 0.9 }}>{selectedTest.title_name || 'Untitled Test'}</p>
            
            {appliedDiscount > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: 'line-through', margin: '0' }}>₹{selectedTest.price || 33}</p>
                <p style={{ color: '#fff', fontSize: '32px', fontWeight: '900', margin: '0' }}>
                  ₹{Math.max(0, (selectedTest.price || 33) - appliedDiscount)}
                </p>
                <p style={{ color: '#10B981', fontSize: '14px', margin: '8px 0 0 0', fontWeight: 'bold' }}>✓ Access Code Applied!</p>
              </div>
            ) : (
              <p style={{ color: '#fff', fontSize: '32px', fontWeight: '900', margin: '0 0 24px 0' }}>₹{selectedTest.price || 33}</p>
            )}
            
            {((selectedTest.price || 33) - appliedDiscount) > 0 && (
              <>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px' }}>
                  <PaymentQR 
                    amount={Math.max(0, (selectedTest.price || 33) - appliedDiscount)} 
                    onSuccess={handlePaymentSuccess}
                    itemId={selectedTest.id}
                  />
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>Scan QR to pay securely via UPI, then enter your Transaction ID below.</p>
                
                <input 
                  type="text" 
                  placeholder="Paste UPI Transaction ID" 
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '16px', marginBottom: '24px', width: '100%', padding: '16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
                />
              </>
            )}

            {!appliedCode && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="Access Code?" 
                  value={accessCodeInput}
                  onChange={e => setAccessCodeInput(e.target.value)}
                  style={{ flex: 1, padding: '16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none', textAlign: 'center' }}
                />
                <button
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
                          showToast("Access Code Applied successfully! Test unlocked instantly.", 'success');
                          setSelectedTest(null);
                          setAccessCodeInput('');
                        } else {
                          showToast("Invalid or Already Used Access Code.", 'error');
                        }
                      } else {
                        showToast("Invalid Access Code format. Must start with PAID-", 'error');
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    setSubmittingPayment(false);
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0 24px', borderRadius: '100px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Apply
                </button>
              </div>
            )}

            <button 
              onClick={submitPayment}
              disabled={submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())}
              style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: (submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())) ? 'rgba(255,255,255,0.1)' : '#EF4444', color: (submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())) ? 'rgba(255,255,255,0.5)' : '#fff', borderRadius: '100px', border: 'none', cursor: (submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (submittingPayment || (((selectedTest.price || 33) - appliedDiscount) > 0 && !paymentId.trim())) ? 'none' : '0 4px 15px rgba(239, 68, 68, 0.4)' }}
            >
              {submittingPayment ? 'Submitting...' : 'Submit Payment'}
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
        <div className="animate-fade-in-up" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
          <div style={{ width: '90%', maxWidth: '400px', background: '#111', padding: '32px', textAlign: 'center', borderRadius: '32px', border: '1px solid rgba(245, 158, 11, 0.3)', position: 'relative' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
               <ClipboardCheck size={40} color="#F59E0B" />
            </div>
            <h2 style={{ fontSize: '24px', margin: '0 0 16px 0', fontWeight: '800', color: '#fff' }}>Approval Pending</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px', lineHeight: 1.6 }}>
              Your payment for <strong>{pendingTest.title_name}</strong> has been submitted.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', lineHeight: 1.6 }}>
              Contact admin on WhatsApp and send a screenshot of your payment for faster activation.
            </p>
            
            <a 
              href={`https://wa.me/916381029380?text=${encodeURIComponent(`Hi Admin, I have made the payment for O-Test: ${pendingTest.title_name}. Please approve my access. My Name: ${currentUser?.fullName || currentUser?.full_name || currentUser?.email}`)}`}
              target="_blank" rel="noreferrer"
              style={{ width: '100%', marginBottom: '16px', background: '#25D366', color: 'white', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '100px', fontWeight: 'bold' }}
            >
              <MessageCircle size={20} style={{ marginRight: '8px' }} />
              WhatsApp Admin
            </a>
            
            <button 
              onClick={() => setShowPending(false)}
              style={{ width: '100%', padding: '16px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
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
};

export default TestOHub;
