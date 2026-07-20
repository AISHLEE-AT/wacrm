import re

with open(r"apps\web\src\app\(aishlee)\teacho\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The UI begins exactly at:
#   return (
#     <div className="animate-fade-in-up bento-grid">
#       {/* Premium Hero Section */}

replacement = r"""  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}>
      
      {/* 2026 AI Netflix-Style Hero */}
      <div className="glass-panel hover-lift" style={{ 
        position: 'relative', overflow: 'hidden', padding: '60px 40px', borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 64, 175, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '12px', color: '#3B82F6' }}>
              <Brain size={24} />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>AI-Powered Learning</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1.1, color: '#fff' }}>
            Master your future with<br/>
            <span className="gradient-text-blue">TeachO AI Academy.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', maxWidth: '600px', lineHeight: 1.6 }}>
            Personalized learning paths, interactive quizzes, and AI-driven insights to accelerate your career.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--cool-gray)' }}>
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="What do you want to learn today?" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', backdropFilter: 'blur(10px)', outline: 'none' }}
              />
              <button 
                onClick={handleVoiceSearch}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '8px', background: isListening ? '#EF4444' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '100px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Mic size={16} className={isListening ? "animate-pulse" : ""} />
              </button>
            </div>
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin/course-builder')}
                style={{ background: '#3B82F6', color: '#fff', padding: '0 24px', borderRadius: '100px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                <PlusCircle size={20} /> Create Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Code Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '16px', color: '#8B5CF6' }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#fff' }}>Have an Access Code?</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Unlock premium courses instantly.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Enter Code (e.g. AISHLEE2026)" 
            value={accessCodeInput}
            onChange={e => setAccessCodeInput(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
          />
          <button 
            onClick={() => handleUnlockCourse(null)} // Generic unlock
            style={{ background: '#8B5CF6', color: '#fff', padding: '0 24px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Unlock
          </button>
        </div>
      </div>

      {/* Filter Categories */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
          {["All", "Recorded Course", "Interactive Advanced", "Test Series", "Notes & Material"].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              style={{ 
                padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap',
                background: filterType === type ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                border: filterType === type ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAdminApprovals(true)}
            style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 20px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <ShieldCheck size={16} /> Approvals
          </button>
        )}
      </div>

      {/* Netflix-style Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cool-gray)' }}>
          <Brain size={40} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#3B82F6' }} />
          Loading curriculum...
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--cool-gray)', borderRadius: '24px' }}>
          <BookOpen size={60} opacity={0.3} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No courses found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {courses.filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => {
            const hasAccess = isAdmin || (course.price === 0) || unlockedCourses.includes(course.id) || userPurchases.some(p => p.item_id === course.id && p.status === 'approved');
            
            return (
              <div 
                key={course.id} 
                className="glass-panel hover-lift"
                style={{ 
                  borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  border: hasAccess ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)'
                }}
                onClick={() => {
                  if (hasAccess) setActiveCourse(course);
                  else setPurchaseModal({ isOpen: true, course, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null });
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: '160px', background: course.image_url ? `url(${course.image_url}) center/cover` : 'linear-gradient(135deg, #1e3a8a, #0f172a)', position: 'relative' }}>
                  {!hasAccess && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.9)', color: '#000', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={14} /> PREMIUM
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {course.type}
                  </div>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-secondary)' }}>{course.class_level}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-secondary)' }}>{course.language}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || "Learn from the best educators with structured courses."}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>
                        {course.profiles?.full_name?.charAt(0) || 'A'}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{course.profiles?.full_name || 'Admin'}</span>
                    </div>
                    {hasAccess ? (
                      <span style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PlayCircle size={16} /> Play
                      </span>
                    ) : (
                      <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '14px' }}>
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => handleEditCourse(e, course)} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDeleteCourse(e, course.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase Modal with UPI QR */}
      {purchaseModal.isOpen && purchaseModal.course && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', overflowY: 'auto', padding: '20px' }}>
          <div className="glass-panel animate-fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '500px', background: '#111', borderRadius: '32px', padding: '32px', margin: 'auto', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => setPurchaseModal({ isOpen: false, course: null, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null })}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: '#3B82F6', margin: '0 0 8px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
              <ShieldCheck size={28} /> Unlock Course
            </h2>
            <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '24px', fontWeight: '600', opacity: 0.9 }}>{purchaseModal.course.title}</h3>

            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '12px', borderRadius: '16px', marginBottom: '24px', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                Premium Content Access
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: purchaseModal.appliedDiscount > 0 ? 'line-through' : 'none', margin: 0 }}>₹{purchaseModal.course.price}</p>
                {purchaseModal.appliedDiscount > 0 && (
                  <p style={{ color: 'white', fontWeight: '800', fontSize: '32px', margin: 0 }}>₹{Math.max(0, purchaseModal.course.price - purchaseModal.appliedDiscount)}</p>
                )}
              </div>
              
              <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px', opacity: (purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0 ? 0.3 : 1, pointerEvents: (purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0 ? 'none' : 'auto' }}>
                <PaymentQR amount={Math.max(0, purchaseModal.course.price - purchaseModal.appliedDiscount)} />
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>Scan the QR code with any UPI app to pay, then enter your Transaction ID below. Or enter an Access Code.</p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Have an Access Code?" 
                  value={purchaseModal.accessCodeInput}
                  onChange={e => setPurchaseModal({...purchaseModal, accessCodeInput: e.target.value.toUpperCase()})}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
                />
                <button 
                  onClick={async () => {
                    if (!purchaseModal.accessCodeInput) return;
                    try {
                      const res = await lmsService.validateAccessCodeForDiscount(purchaseModal.accessCodeInput);
                      if (res.valid) {
                        setPurchaseModal({...purchaseModal, appliedDiscount: res.discountValue, appliedCode: res.code});
                        alert(`Success! Discount of ₹${res.discountValue} applied.`);
                      } else {
                        alert("Invalid code.");
                      }
                    } catch (e) { alert("Error: " + e.message); }
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0 24px', borderRadius: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Apply
                </button>
              </div>

              <input 
                type="text" 
                placeholder="Paste UPI Transaction ID here" 
                value={purchaseModal.paymentId}
                onChange={e => setPurchaseModal({...purchaseModal, paymentId: e.target.value})}
                disabled={(purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0}
                style={{ textAlign: 'center', fontSize: '16px', marginBottom: '24px', width: '100%', padding: '16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
              />
              
              <button 
                onClick={async () => {
                  const finalPrice = Math.max(0, purchaseModal.course.price - (purchaseModal.appliedDiscount || 0));
                  if (finalPrice > 0 && !purchaseModal.paymentId.trim()) {
                    alert("Please enter UPI Transaction ID");
                    return;
                  }
                  setSubmittingPayment(true);
                  try {
                    await purchaseService.submitPurchase(
                      currentUser?.id,
                      purchaseModal.course.id,
                      'course',
                      finalPrice === 0 ? `FREE_CODE_${purchaseModal.appliedCode}` : purchaseModal.paymentId.trim(),
                      currentUser?.fullName || currentUser?.full_name || currentUser?.user_metadata?.full_name || 'User',
                      currentUser?.whatsapp || ''
                    );
                    
                    if (finalPrice === 0 && purchaseModal.appliedCode) {
                      await lmsService.consumeAccessCode(purchaseModal.appliedCode);
                    }
                    
                    alert(finalPrice === 0 ? "Course Unlocked Instantly!" : "Payment submitted for Admin Approval!");
                    setPurchaseModal({ isOpen: false, course: null, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null });
                  } catch (e) {
                    alert("Failed to submit payment.");
                  }
                  setSubmittingPayment(false);
                }}
                disabled={submittingPayment}
                style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: '#3B82F6', color: '#fff', borderRadius: '100px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                {submittingPayment ? 'Processing...' : (purchaseModal.course.price - purchaseModal.appliedDiscount <= 0 ? 'Unlock for Free' : 'Submit Payment')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};\n\nexport default TeachO;
"""

new_content = re.sub(
    r'  return \(\n    <div className="animate-fade-in-up bento-grid">\n      {\/\* Premium Hero Section \*\/}.*export default TeachO;\n?',
    replacement,
    content,
    flags=re.DOTALL
)

with open(r"apps\web\src\app\(aishlee)\teacho\page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
