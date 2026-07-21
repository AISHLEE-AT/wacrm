// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Store, MessageCircle, Info, PlusCircle, CheckCircle, X, Trash2, MapPin, Loader, Camera, Upload, Share2, Search, Edit } from 'lucide-react';
import { useApp } from '@/aishlee/context/AppProvider';
import { dataService } from '@/aishlee/services/dataService';
import { ecosystemService } from '@/aishlee/services/ecosystemService';
import { marketplaceSheetsService } from '@/aishlee/services/marketplaceSheetsService';
import { purchaseService } from '@/aishlee/services/purchaseService';
import { lmsService } from '@/aishlee/services/lmsService';
import { QrCode } from 'lucide-react';
import { PaymentQR } from '@/aishlee/components/PaymentQR';

const TradeO = () => {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  // Purchase State
  const [userPurchases, setUserPurchases] = useState([]);
  const [purchaseModal, setPurchaseModal] = useState({ isOpen: false, item: null, paymentId: '', accessCodeInput: '', appliedDiscount: 0, appliedCode: null });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Grocery store items', price: '', unit: '', imageUrl: '', description: ''
  });


  const adminPhone = "919344532738"; // Admin WhatsApp Number

  useEffect(() => {
    loadListings();
    if (currentUser?.id) {
      purchaseService.getUserPurchases(currentUser.id)
        .then(data => setUserPurchases(data || []))
        .catch(err => console.error("Error loading purchases:", err));
    }
  }, [currentUser?.id]);

  const loadListings = async () => {
    try {
      setLoading(true);
      // Fetch from Google Sheets Master using Pincode
      const sheetData = await marketplaceSheetsService.fetchListings();
      
      const combined = sheetData.filter(item => !item.pincode || item.pincode == (currentUser?.permanent_pincode || currentUser?.pincode));
      setListings(combined);
      
      const uniqueCats = ['All', ...new Set(combined.map(i => i.category))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleBrokerageInquiry = (item) => {
    const targetNumber = item.whatsappNumber || adminPhone;
    const refCode = localStorage.getItem('active_referral');
    let text = `Hi, I am interested in the following listing from the LocalMarket:\n\n*${item.title}*\nCategory: ${item.category}\nPrice: ₹${item.price} ${item.unit || ''}\n\n`;
    if (refCode) text += `[Referred By: ${refCode}]\n\n`;
    text += `Can you please provide more details?`;
    window.open(`https://wa.me/${(String(targetNumber).replace(/\D/g, '').length === 10 ? '91' + String(targetNumber).replace(/\D/g, '') : String(targetNumber).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = (item) => {
    if (!currentUser?.whatsapp) {
      showToast("Please update your profile with your WhatsApp number to earn referral points!", 'error');
      return;
    }
    const url = `${window.location.origin}/ecosystem?ref=${currentUser.whatsapp}`;
    const text = `Check out this amazing item: ${item.title} on Thamizhan LocalMarket! Buy using my referral link here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleListMyService = () => {
    if (!currentUser) return showToast("Please login to create a listing.", 'error');
    if (!currentUser.upi_id) {
      showToast("Please update your UPI ID in your Profile before adding a listing so buyers can pay you directly.", 'error');
      window.location.href = '/profile';
      return;
    }
    setEditingItem(null);
    setFormData({ title: '', category: 'Grocery store items', price: '', unit: '', imageUrl: '', description: '' });
    setShowAddForm(true);
  };

  const handleEditListing = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Grocery store items',
      price: item.price || '',
      unit: item.unit || '',
      imageUrl: item.imageUrl || item.mediaUrl || '',
      description: item.description || ''
    });
    setShowAddForm(true);
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    
    if (editingItem) {
      showToast("Since this LocalMarket item is synced to your Master Google Sheet, the app cannot modify the database directly yet.\\n\\nYour edited values are:\\nTitle: " + formData.title + "\\nCategory: " + formData.category + "\\nPrice: " + formData.price + "\\nImage URL: " + formData.imageUrl + "\\n\\nPlease copy these into your Google Sheet to permanently apply the change!", 'info');
      setShowAddForm(false);
      setEditingItem(null);
      return;
    }

    // Prevent massive pasted base64 strings from crashing the API
    if (formData.imageUrl && formData.imageUrl.startsWith('data:image') && formData.imageUrl.length > 200000) {
      showToast("The pasted image is too large! Please use the 'Upload' or 'Camera' button below the text box instead so we can optimize it.", 'error');
      return;
    }

    setSubmitting(true);
    try {
      await ecosystemService.createListing({
        lister_id: currentUser.id,
        title: formData.title,
        type: formData.category, // Map category to type
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        status: 'PENDING',
        seller_upi_id: currentUser.upi_id,
        details: {
          unit: formData.unit,
          image_url: formData.imageUrl
        }
      });
      showToast("Listing submitted successfully! It is now pending Admin approval.", 'success');
      setShowAddForm(false);
      setFormData({ title: '', category: 'Agriculture', price: '', unit: '', imageUrl: '', description: '' });
    } catch (err) {
      console.error(err);
      showToast(`Failed to submit listing. Error: ${err.message || JSON.stringify(err)}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseSubmit = async () => {
    if (!purchaseModal.paymentId || purchaseModal.paymentId.trim() === '') {
      showToast("Please enter a valid Payment Transaction ID.", 'error');
      return;
    }

    setSubmittingPayment(true);
    try {
      const bName = currentUser.fullName || currentUser.full_name || currentUser.user_metadata?.full_name || 'User';
      const bContact = currentUser.whatsapp || '';
      const categoryStr = purchaseModal.item.category || 'LocalMarket';
      const inputVal = purchaseModal.paymentId.trim();

      if (inputVal.toUpperCase().startsWith('PAID-')) {
          const isValid = await lmsService.validateAndConsumeCode(inputVal.toUpperCase());
          if (isValid) {
              await purchaseService.submitPurchase(
                currentUser.id,
                purchaseModal.item.id,
                categoryStr,
                inputVal.toUpperCase(),
                bName,
                bContact,
                'APPROVED'
              );
              showToast("Success! Asset Unlocked permanently for free using your Access Code.", 'success');
              setPurchaseModal({ isOpen: false, item: null, paymentId: '' });
          } else {
              showToast("Invalid or already consumed Access Code.", 'error');
          }
      } else {
          await purchaseService.submitPurchase(
            currentUser.id,
            purchaseModal.item.id,
            categoryStr,
            inputVal,
            bName,
            bContact
          );
          
          showToast("Payment ID submitted successfully! The Admin will verify it shortly. You will receive a notification once approved.", 'success');
          setPurchaseModal({ isOpen: false, item: null, paymentId: '' });
      }
      
      // Refresh purchases
      const updatedPurchases = await purchaseService.getUserPurchases(currentUser.id);
      setUserPurchases(updatedPurchases || []);
    } catch (e) {
      showToast("Failed to submit payment. Please try again.", 'error');
      console.error(e);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to Base64 (60% quality JPEG) to fit easily in DB text field
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData({ ...formData, imageUrl: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const filteredListings = listings.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim() === '' ? [] : listings.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const getPlaceholders = (cat) => {
    switch (cat) {
      case 'Agriculture': return { title: 'e.g., Organic Tomatoes', unit: 'e.g., / kg', desc: 'Describe your product...' };
      case 'Real Estate': return { title: 'e.g., 2 BHK Apartment', unit: 'e.g., / sqft', desc: 'Describe the property...' };
      case 'Education': return { title: 'e.g., React JS Course', unit: 'e.g., / month', desc: 'Describe the course...' };
      case 'Services': return { title: 'e.g., Web Development, Electrician', unit: 'e.g., / hour', desc: 'Describe your service...' };
      default: return { title: 'e.g., Product Title', unit: 'e.g., / unit', desc: 'Describe your listing...' };
    }
  };
  const ph = getPlaceholders(formData.category);

  return (
    <div className="animate-fade-in-up bento-grid">
      
      {/* Toast Notification */}
      {toast.show && createPortal(
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: toast.type === 'error' ? '#EF4444' : 'var(--tech-cyan)', color: toast.type === 'error' ? 'white' : 'black', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeInUp 0.3s ease' }}>
          {toast.type === 'error' ? <Info size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* HEADER */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0, fontWeight: '900' }}>Aishlee Market</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0', color: 'var(--cool-gray)' }}>Discover local real estate, education, groceries, and products.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleListMyService} className="btn-primary hover-glow" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--tech-cyan)', color: 'black' }}>
            <PlusCircle size={18} />
            List on LocalMarket
          </button>
        </div>
      </div>

      {/* SMART SEARCH WITH AUTOCOMPLETE */}
      <div className="bento-item span-12 glass-panel" style={{ position: 'relative', display: 'flex', gap: '8px', padding: '12px', alignItems: 'center' }} onMouseLeave={() => setShowSuggestions(false)}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--tech-cyan)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search LocalMarket (e.g. Tomatoes, AC Repair)..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'white', fontSize: '16px', outline: 'none' }}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#1F2937', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              {searchSuggestions.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSearchQuery(item.title);
                    setShowSuggestions(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: idx !== searchSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s' }}
                >
                  <img src={item.imageUrl || item.mediaUrl || '/thamizhan-logo.jpg'} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} alt="" />
                  <div>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ color: 'var(--cool-gray)', fontSize: '12px' }}>{item.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowSuggestions(false)}
          style={{ background: 'var(--tech-cyan)', color: 'black', fontWeight: 'bold', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* CATEGORY TABS */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            
            <h2 className="gradient-text-teal" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
              <PlusCircle size={24} /> {editingItem ? 'Edit Listing' : 'Create Listing'}
            </h2>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
              {editingItem ? 'Edit your product details. These changes will need to be synced with your Google Sheet.' : 'Submit your product or service. An admin will review it before it appears on the LocalMarket.'}
            </p>

            <form onSubmit={handleSubmitListing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Title</label>
                <input required className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={ph.title} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Category</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%' }}>
                    {categories.filter(c => c !== 'All').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                    {categories.length <= 1 && (
                      <option value="General">General</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Price (₹)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Unit</label>
                  <input className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder={ph.unit} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Image URL or Upload</label>
                  <input className="input-field" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://... or click below" style={{ width: '100%', marginBottom: '8px' }} />
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label className="btn-outline" style={{ flex: 1, padding: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', margin: 0 }}>
                      <Upload size={14} /> Upload
                      <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                    </label>
                    <label className="btn-outline" style={{ flex: 1, padding: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', margin: 0 }}>
                      <Camera size={14} /> Camera
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Image optimized & attached
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--cool-gray)', marginBottom: '4px' }}>Description</label>
                <textarea required className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={ph.desc} rows={3}></textarea>
              </div>

              <button disabled={submitting} type="submit" className="btn-primary" style={{ background: 'var(--tech-cyan)', color: 'black', fontWeight: 'bold' }}>
                {submitting ? 'Processing...' : (editingItem ? 'Save Changes' : 'Submit for Approval')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }} className="hide-scrollbar">
          <span style={{ fontWeight: "bold", color: "var(--cool-gray)", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
            Categories:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTINGS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--cool-gray)', padding: 60 }}>Loading localmarket...</div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <Store size={48} color="var(--cool-gray)" style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
          <h3 style={{ color: 'white', margin: 0 }}>No Listings Found</h3>
          <p style={{ color: 'var(--cool-gray)', margin: '8px 0 0 0' }}>There are currently no items in this category.</p>
        </div>
      ) : (
        <div className="bento-grid span-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredListings.map(item => (
            <div key={item.id} className="glass-panel hover-lift" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingBottom: '60%' }}>
                <img 
                  src={item.imageUrl || item.mediaUrl || '/thamizhan-logo.jpg'} 
                  alt={item.title} 
                  onError={(e) => { if (!e.target.dataset.error) { e.target.dataset.error = true; e.target.src = '/thamizhan-logo.jpg'; e.target.style.objectFit = 'contain'; e.target.style.padding = '20px'; } }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {item.category}
                  </div>
                  {(() => {
                    const purchase = userPurchases.find(p => String(p.item_id) === String(item.id));
                    if (!purchase) return null;
                    if (String(purchase.status).toUpperCase() === 'APPROVED') {
                      return (
                        <div style={{ background: '#10B981', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> Approved
                        </div>
                      );
                    }
                    if (String(purchase.status).toUpperCase() === 'PENDING') {
                      return (
                        <div style={{ background: '#F59E0B', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Loader size={12} className="spin" /> Waiting Approval
                        </div>
                      );
                    }
                    return (
                      <div style={{ background: '#6B7280', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {purchase.status}
                      </div>
                    );
                  })()}
                </div>
                {isAdmin && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button onClick={() => handleEditListing(item)} style={{ background: 'var(--tech-cyan)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'black' }} title="Edit Listing">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => { showToast('This LocalMarket item is synced directly from your Master Google Sheet.\\n\\nTo Delete: Please delete the row in your Google Sheet.\\nThe app will automatically remove it.', 'info'); }} style={{ background: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'white' }} title="Delete in Sheet">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '18px', color: 'white', margin: '0 0 8px 0' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--cool-gray)', margin: '0 0 16px 0', lineHeight: '1.5', flex: 1 }}>{item.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '16px' }}>
                  <MapPin size={14} /> {item.seller || 'Verified Seller'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '20px', color: 'var(--tech-cyan)', fontWeight: 'bold' }}>₹{item.price.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--cool-gray)' }}>{item.unit}</div>
                  </div>
                  
                  <button 
                    onClick={() => handleBrokerageInquiry(item)}
                    className="btn-primary" 
                    style={{ background: '#25D366', color: 'white', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none' }}
                  >
                    <MessageCircle size={16} /> Contact Seller
                  </button>
                  <button 
                    onClick={() => setPurchaseModal({ isOpen: true, item, paymentId: '', accessCodeInput: '', appliedDiscount: 0, appliedCode: null })}
                    className="btn-primary" 
                    style={{ background: 'var(--tech-cyan)', color: 'black', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none' }}
                  >
                    <QrCode size={16} /> Buy Now
                  </button>
                  <button 
                    onClick={() => handleShare(item)}
                    className="btn-outline" 
                    style={{ padding: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#8B5CF6', color: '#8B5CF6' }}
                    title="Refer & Earn Points"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Purchase Modal */}
      {purchaseModal.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ position: 'relative', width: '90%', maxWidth: '400px', background: 'var(--surface-bg)', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center' }}>
            <button 
              onClick={() => setPurchaseModal({ isOpen: false, item: null, paymentId: '', accessCodeInput: '', appliedDiscount: 0, appliedCode: null })}
              className="btn-outline hover-glow"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: 'var(--tech-cyan)', margin: '0 0 8px 0', fontSize: '22px' }}>Checkout</h2>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{purchaseModal.item?.title}</p>
            
            {purchaseModal.appliedDiscount > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--cool-gray)', fontSize: '18px', textDecoration: 'line-through', margin: '0' }}>₹{purchaseModal.item?.price}</p>
                <p style={{ color: 'var(--tech-gold)', fontSize: '24px', fontWeight: '900', margin: '0' }}>
                  ₹{Math.max(0, purchaseModal.item?.price - purchaseModal.appliedDiscount)}
                </p>
                <p style={{ color: 'var(--tech-cyan)', fontSize: '14px', margin: '4px 0 0 0' }}>✓ Access Code Applied!</p>
              </div>
            ) : (
              <p style={{ color: 'var(--tech-gold)', fontSize: '24px', fontWeight: '900', margin: '0 0 24px 0' }}>₹{purchaseModal.item?.price}</p>
            )}
            
            {(purchaseModal.item?.price - (purchaseModal.appliedDiscount || 0)) > 0 && (
              <>
                <PaymentQR amount={Math.max(0, purchaseModal.item?.price - (purchaseModal.appliedDiscount || 0))} />
                
                <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '16px', marginTop: '16px' }}>Scan the QR code to pay the balance, then enter your Payment Transaction ID below.</p>
                
                <input 
                  type="text" 
                  placeholder="UPI Transaction ID" 
                  value={purchaseModal.paymentId || ''}
                  onChange={e => setPurchaseModal({ ...purchaseModal, paymentId: e.target.value })}
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '16px', marginBottom: '16px' }}
                />
              </>
            )}

            {!purchaseModal.appliedCode && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Have an Access Code?" 
                  value={purchaseModal.accessCodeInput || ''}
                  onChange={e => setPurchaseModal({ ...purchaseModal, accessCodeInput: e.target.value })}
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '16px', flex: 1 }}
                />
                <button
                  className="btn-outline"
                  disabled={!purchaseModal.accessCodeInput || submittingPayment}
                  onClick={async () => {
                    setSubmittingPayment(true);
                    try {
                      const inputVal = purchaseModal.accessCodeInput.trim().toUpperCase();
                      if (inputVal.startsWith('PAID-')) {
                        const isValid = await lmsService.validateAndConsumeCode(inputVal);
                        if (isValid) {
                          const bName = currentUser?.name || 'User';
                          const bContact = currentUser?.email || 'No Email';
                          const isTool = purchaseModal.item.category === 'Digital Tool';
                          const isBook = purchaseModal.item.category === 'Book';
                          const categoryStr = isTool ? 'Tool' : (isBook ? 'Book' : 'Asset');

                          await purchaseService.submitPurchase(
                            currentUser.id,
                            purchaseModal.item.id,
                            categoryStr,
                            inputVal,
                            bName,
                            bContact,
                            'APPROVED'
                          );
                          showToast("Access Code Applied successfully! Asset unlocked instantly.", 'success');
                          setPurchaseModal({ isOpen: false, item: null, paymentId: '' });
                        } else {
                          showToast("Invalid or already consumed Access Code.", 'error');
                        }
                      } else {
                        showToast("Invalid Access Code format. Must start with PAID-", 'error');
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    setSubmittingPayment(false);
                  }}
                  style={{ padding: '0 16px', borderRadius: '8px' }}
                >
                  Apply
                </button>
              </div>
            )}
            
            <button 
              className="btn-primary" 
              disabled={submittingPayment || ((purchaseModal.item?.price - (purchaseModal.appliedDiscount || 0)) > 0 && !purchaseModal.paymentId)}
              onClick={async () => {
                setSubmittingPayment(true);
                try {
                  const bName = currentUser.fullName || currentUser.full_name || currentUser.user_metadata?.full_name || 'User';
                  const bContact = currentUser.whatsapp || '';
                  const categoryStr = purchaseModal.item.category || 'LocalMarket';
                  const balance = Math.max(0, purchaseModal.item.price - (purchaseModal.appliedDiscount || 0));
                  
                  let finalPaymentId = purchaseModal.paymentId?.trim();
                  if (purchaseModal.appliedCode) {
                      if (balance === 0) {
                          finalPaymentId = purchaseModal.appliedCode;
                      } else {
                          finalPaymentId = `${finalPaymentId} (Code: ${purchaseModal.appliedCode})`;
                      }
                  }

                  if (balance === 0 && purchaseModal.appliedCode) {
                      await purchaseService.submitPurchase(currentUser.id, purchaseModal.item.id, categoryStr, finalPaymentId, bName, bContact, 'APPROVED');
                      showToast("Success! Asset Unlocked perfectly for free using your Access Code.", 'success');
                  } else {
                      await purchaseService.submitPurchase(currentUser.id, purchaseModal.item.id, categoryStr, finalPaymentId, bName, bContact);
                      showToast("Payment details submitted! Once the payment is verified, your order will be delivered quickly.", 'success');
                  }
                  
                  const newPurchases = await purchaseService.getUserPurchases(currentUser.id);
                  setUserPurchases(newPurchases || []);
                  setPurchaseModal({ isOpen: false, item: null, paymentId: '', accessCodeInput: '', appliedDiscount: 0, appliedCode: null });
                } catch (e) {
                  showToast("Failed to submit payment. Please try again.", 'error');
                }
                setSubmittingPayment(false);
              }}
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            >
              {submittingPayment ? 'Submitting...' : ((purchaseModal.item?.price - (purchaseModal.appliedDiscount || 0)) === 0 ? 'Unlock for Free' : 'Submit Purchase')}
            </button>
          </div>
        </div>
      , document.body)}

    </div>
  );
};

export default TradeO;

