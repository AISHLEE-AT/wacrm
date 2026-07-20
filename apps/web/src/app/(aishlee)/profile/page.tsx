// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { lmsService } from '@/aishlee/services/lmsService';
import { purchaseService } from '@/aishlee/services/purchaseService';
import { UserCircle, ShieldCheck, Phone, LogOut, Lock, CheckCircle, Smartphone, MapPin, Briefcase, GraduationCap, Link as LinkIcon, Key, RefreshCw, Star, Flag, FileText, Camera, Upload, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
  'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

const EDUCATION_LEVELS = [
  'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Under Graduate (UG)', 'Post Graduate (PG)', 'PhD', 'Other'
];

const CATEGORY_TO_EMPLOYMENT = {
  Student: ['Student'],
  Employee: ['Employed'],
  Teacher: ['Employed'],
  Employer: ['Business'],
  Farmer: ['Self-Employed', 'Business'],
  Trader: ['Business', 'Self-Employed'],
  Financier: ['Business', 'Self-Employed'],
  Professional: ['Self-Employed', 'Employed', 'Business'],
  Agent: ['Self-Employed', 'Business']
};

export default function Profile() {
  const { currentUser, updateProfile, logout, refreshUserPoints } = useApp();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || ''); 
  const [permanentPincode, setPermanentPincode] = useState(currentUser?.permanent_pincode || '');
  
  // Resume Fields
  const [location, setLocation] = useState(currentUser?.location || '');
  const [educationLevel, setEducationLevel] = useState(currentUser?.education_level || '');
  const [employmentStatus, setEmploymentStatus] = useState(currentUser?.employment_status || '');
  const [skills, setSkills] = useState(currentUser?.skills || '');
  const [politicalInterest, setPoliticalInterest] = useState(currentUser?.political_interest || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  const [referrerCode, setReferrerCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const [myReferrals, setMyReferrals] = useState<any[]>([]);
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [topRankers, setTopRankers] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  // Helper to format item IDs into readable titles
  const formatItemName = (itemId) => {
    if (!itemId) return 'Unknown Item';
    let name = itemId.replace('sheet-v2-', '').replace('listing_', '').replace('db-', '');
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  React.useEffect(() => {
    if (currentUser?.whatsapp) {
      supabase.from('profiles').select('*').eq('referred_by', currentUser.whatsapp).then(({ data }) => {
        if (data) setMyReferrals(data);
      });
    }
    
    if (currentUser?.id) {
      purchaseService.getUserPurchases(currentUser.id).then(data => {
        setUserPurchases(data || []);
      }).catch(err => console.error('Error fetching purchases:', err));
    }
    
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') {
      lmsService.getCourses({ adminId: currentUser.id }).then(courses => {
        setAdminCourses(courses.filter(c => c.price > 0));
      });
    }

    // Fetch Top 2 Rank Holders
    supabase.from('profiles')
      .select('full_name, points, role')
      .order('points', { ascending: false })
      .limit(2)
      .then(({ data }) => {
        if (data) setTopRankers(data);
      });

  }, [currentUser]);

  const handleGenerateCourseCode = async () => {
    // Generate a universal access code with the 'PAID-' prefix
    const newCode = 'PAID-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      // For admins updating the universal admin code
      await lmsService.updateCourseAccessCode('universal-admin-code', newCode, currentUser.id);
      setAdminCourses([{ id: 'generic', title: 'Universal Access Code', access_code: newCode }]);
      setSuccess('New Access Code generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to generate access code');
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('Uploading image to secure storage...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setSuccess('Profile picture uploaded successfully! Click "Update Details" to save your profile.');
    } catch (err: any) {
      console.error(err);
      setError('Failed to upload image. Have you created the "avatars" bucket?');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!whatsapp || !whatsapp.trim() || !permanentPincode || !permanentPincode.trim()) {
      alert('WhatsApp Number and Permanent Pincode are required fields. You cannot save without them.');
      return;
    }
    
    if (!/^[6-9]\d{9}$/.test(whatsapp)) {
      setError('WhatsApp number must be a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^6\d{5}$/.test(permanentPincode)) {
      setError('Pincode must be a valid 6-digit Tamil Nadu pincode (starts with 6).');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({ 
        full_name: fullName, 
        whatsapp,
        permanent_pincode: permanentPincode,
        location,
        education_level: educationLevel,
        employment_status: employmentStatus,
        skills,
        political_interest: politicalInterest,
        bio,
        avatar_url: avatarUrl
      });
      
      const hasApiKey = localStorage.getItem('gemini_api_key');
      if (isOnboarding && hasApiKey) {
        setSuccess('Profile complete! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else if (isOnboarding && !hasApiKey) {
        setSuccess('Profile updated! Please set your Gemini API Key below to unlock the platform.');
      } else {
        setSuccess('Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Simple reverse geocode using free API for demo purposes
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.state_district || data.address.state || "Tamil Nadu";
          setLocation(city);
          setSuccess("Location detected securely!");
        } catch {
          setError("Failed to fetch location name.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  const handleSetReferrer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({ referred_by: referrerCode });
      setSuccess('Referral code applied successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwdError) throw pwdError;
      setSuccess('Password updated securely!');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRedeemPoints = async () => {
    if (!currentUser?.points || currentUser.points < 100) {
      setError('You need at least 100 points to redeem a Free Access Code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const newPoints = currentUser.points - 100;
      const universalCode = "PAID-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error: updateErr } = await supabase.from('profiles').update({ points: newPoints }).eq('id', currentUser.id);
      if (updateErr) throw updateErr;
      
      // Save code to database so it can be consumed automatically
      const { error: insertErr } = await supabase.from('lms_courses').insert([{
        admin_id: currentUser.id,
        title: `User Reward Access Code - ${universalCode}`,
        content: 'Reward Code Stub',
        type: 'Course',
        class_level: 'All',
        language: 'English',
        access_code: universalCode
      }]);
      
      if (insertErr) {
        // Rollback points
        await supabase.from('profiles').update({ points: currentUser.points }).eq('id', currentUser.id);
        throw insertErr;
      }
      
      setSuccess(`Success! Your Universal Access Code is: ${universalCode}. You can enter this code when buying any Course to unlock it for FREE!`);
      if (refreshUserPoints) await refreshUserPoints();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    
    if (isOnboarding && whatsapp && location && educationLevel && employmentStatus) {
      setSuccess('API Key saved! Platform Unlocked. Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } else if (isOnboarding) {
      setSuccess('API Key saved! Please ensure your Personal Details are complete to unlock the platform.');
    } else {
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setLoading(true);
    setError('');
    try {
      await purchaseService.deletePurchase(purchaseId);
      setUserPurchases(prev => prev.filter(p => p.id !== purchaseId));
      setSuccess('Order deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {isOnboarding && (
        <div style={{ background: '#EF4444', color: 'white', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
          <ShieldCheck size={24} />
          <div>
            <h3 style={{ margin: '0 0 4px 0' }}>Mandatory Setup Required</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Please complete your <strong>Personal Details</strong> (marked with *) and set your <strong>Gemini API Key</strong> to unlock the platform.</p>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>My Profile</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Manage your identity and security settings.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/resume/${currentUser?.id}`)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--tech-cyan)', color: 'black' }}>
            <FileText size={18} /> Digital ID
          </button>
          <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', borderColor: '#EF4444' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #EF4444' }}>{error}</div>}
      {success && <div style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #10B981' }}><CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* GAMIFICATION: Ranking Section */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--logo-orange)', gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(16, 185, 129, 0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* User Points */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '16px', borderRadius: '50%', border: '2px solid rgba(249, 115, 22, 0.3)' }}>
                <Star color="var(--logo-orange)" size={32} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--cool-gray)', textTransform: 'uppercase', fontWeight: 'bold' }}>My Ranking Points</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {currentUser?.points || 0} <span style={{ fontSize: '14px', color: 'var(--tech-cyan)', fontWeight: 'normal' }}>pts</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--tech-teal)', marginTop: '4px', marginBottom: '12px' }}>Earn points by using the app & referring friends!</div>
                <button 
                  onClick={handleRedeemPoints}
                  className="btn-primary" 
                  style={{ background: 'var(--tech-gold)', color: 'black', padding: '6px 12px', fontSize: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={loading || (currentUser?.points || 0) < 100}
                >
                  <Key size={14} /> Exchange 100 Pts for Access Code
                </button>
              </div>
            </div>

            {/* Top Rankers Leaderboard */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', minWidth: '250px', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--cool-gray)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag size={14} color="var(--tech-gold)" /> Top Community Leaders
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topRankers.map((ranker, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: idx === 0 ? 'var(--tech-gold)' : 'var(--cool-gray)', fontWeight: 'bold' }}>#{idx + 1}</span>
                      <span style={{ color: 'white', fontSize: '14px' }}>{ranker.full_name || 'Anonymous'}</span>
                    </div>
                    <span style={{ color: 'var(--logo-orange)', fontWeight: 'bold', fontSize: '14px' }}>{ranker.points} pts</span>
                  </div>
                ))}
                {topRankers.length === 0 && <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>No rankers yet. Be the first!</div>}
              </div>
            </div>

          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--tech-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                onError={(e) => { if (!e.target.dataset.error) { e.target.dataset.error = true; e.target.src = '/logo.jpg'; e.target.style.padding = '8px'; e.target.style.background = '#1a1a1a'; } }}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--tech-cyan)' }} 
              />
            ) : (
              currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' ? <ShieldCheck size={64} color="var(--tech-gold)" /> : <UserCircle size={64} color="var(--tech-cyan)" />
            )}
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{currentUser?.fullName}</div>
              <div style={{ color: 'var(--cool-gray)', fontSize: '14px' }}>{currentUser?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <label className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', justifyContent: 'center', margin: 0 }}>
              <Upload size={14} /> Upload Pic
              <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </label>
            <label className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', justifyContent: 'center', margin: 0 }}>
              <Camera size={14} /> Camera
              <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--cool-gray)', fontSize: '12px', textTransform: 'uppercase' }}>System Role</span>
            <span style={{ color: 'var(--tech-cyan)', fontWeight: 'bold', fontSize: '14px' }}>{currentUser?.role}</span>
          </div>

          {(currentUser?.main_category || currentUser?.sub_categories?.length > 0) && (
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--cool-gray)', fontSize: '12px', textTransform: 'uppercase' }}>Profile Category</span>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{currentUser?.main_category}</span>
              </div>
              {currentUser?.sub_categories?.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--cool-gray)', fontSize: '12px', textTransform: 'uppercase' }}>Specializations</span>
                  <span style={{ color: 'var(--logo-orange)', fontWeight: 'bold', fontSize: '14px', textAlign: 'right' }}>
                    {currentUser.sub_categories.join(', ')}
                  </span>
                </div>
              )}
              <button 
                onClick={() => navigate('/onboarding')} 
                className="btn-outline" 
                style={{ marginTop: '8px', fontSize: '12px', padding: '6px' }}
              >
                Change App Profile
              </button>
            </div>
          )}
        </div>

        {/* Update Details Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>Personal Details</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Full Name <span style={{color: '#EF4444'}}>*</span></label>
              <input type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>WhatsApp Number <span style={{color: '#EF4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="text" className="input-field" style={{ paddingLeft: '36px' }} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91..." required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Permanent Pincode <span style={{color: '#EF4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="text" className="input-field" style={{ paddingLeft: '36px' }} value={permanentPincode} onChange={e => setPermanentPincode(e.target.value)} placeholder="e.g. 600001" maxLength="6" required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>District (Tamil Nadu) <span style={{color: '#EF4444'}}>*</span></label>
              <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select className="input-field" value={location} onChange={e => setLocation(e.target.value)} required>
                    <option value="">Select District</option>
                    {TN_DISTRICTS.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Education Level <span style={{color: '#EF4444'}}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                  <select className="input-field" style={{ paddingLeft: '36px' }} value={educationLevel} onChange={e => setEducationLevel(e.target.value)} required>
                    <option value="">Select Level</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Employment Status <span style={{color: '#EF4444'}}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                  <select className="input-field" style={{ paddingLeft: '36px' }} value={employmentStatus} onChange={e => setEmploymentStatus(e.target.value)} required>
                    <option value="">Select Status</option>
                    {(CATEGORY_TO_EMPLOYMENT[currentUser?.main_category] || ['Student', 'Employed', 'Unemployed', 'Self-Employed', 'Business']).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Key Skills</label>
              <div style={{ position: 'relative' }}>
                <Star size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="text" className="input-field" style={{ paddingLeft: '36px' }} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Python, Public Speaking" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Political Interest</label>
              <div style={{ position: 'relative' }}>
                <Flag size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="text" className="input-field" style={{ paddingLeft: '36px' }} value={politicalInterest} onChange={e => setPoliticalInterest(e.target.value)} placeholder="e.g. Interested in local governance" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Bio / About Me</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <textarea className="input-field" style={{ paddingLeft: '36px', minHeight: '80px', paddingTop: '12px' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio about yourself..." />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>Save Personal Details</button>
          </form>
        </div>

        {/* Admin Course Access Code Generator */}
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
          <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1', borderLeft: '4px solid var(--tech-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Key size={24} color="var(--tech-gold)" />
              <h3 style={{ margin: 0, color: 'white' }}>Course Access Code Generator</h3>
            </div>
            <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px' }}>
              Generate universal access codes for your Paid Courses. Share these secret codes via WhatsApp only after receiving payment. The code can be used once.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '12px', fontSize: '15px' }}>One-Time Unlock Code</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: adminCourses[0]?.access_code ? '#10B981' : 'var(--cool-gray)', letterSpacing: '2px' }}>
                    {adminCourses[0]?.access_code || 'NO CODE GENERATED'}
                  </div>
                  <button 
                    onClick={handleGenerateCourseCode} 
                    className="btn-outline" 
                    style={{ padding: '6px', minWidth: 'auto', border: 'none' }}
                    title="Generate New Code"
                  >
                    <RefreshCw size={16} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security / Password */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>Security</h3>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="password" minLength={6} className="input-field" style={{ paddingLeft: '36px' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Minimum 6 characters" />
              </div>
            </div>
            <button type="submit" className="btn-outline" disabled={loading}>Update Password</button>
          </form>
        </div>


        {/* AI Suite API Key */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>AI Suite Preferences <span style={{color: '#EF4444'}}>*</span></h3>
          <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px' }}>
            To unlock unlimited usage in the AI Suite, you must provide your own free Gemini API Key. This is saved securely only on your local device.
          </p>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--tech-cyan)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '14px' }}>How to get your free API Key:</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--cool-gray)', fontSize: '13px', lineHeight: '1.6' }}>
              <li>Click the button below to open Google AI Studio.</li>
              <li>Sign in with your Google account.</li>
              <li>Click <strong>"Get API key"</strong> on the left menu, then <strong>"Create API key"</strong>.</li>
              <li>Copy the generated key and paste it below.</li>
            </ol>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
              <Link size={14} /> Open Google AI Studio
            </a>
          </div>

          <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', fontSize: '12px', marginBottom: '6px' }}>Your Gemini API Key <span style={{color: '#EF4444'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                <input type="password" className="input-field" style={{ paddingLeft: '36px' }} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..." required />
              </div>
            </div>
            <button type="submit" className="btn-outline" disabled={loading}>Save Key to Browser</button>
          </form>
        </div>

        {/* Add Referral Code (if not set) */}
        {!currentUser?.referred_by && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>Who Invited You?</h3>
            <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px' }}>If a friend invited you (e.g. via Social Login), enter their cell number here.</p>
            <form onSubmit={handleSetReferrer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ position: 'relative' }}>
                  <UserCircle size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '14px', left: '12px' }} />
                  <input type="text" className="input-field" style={{ paddingLeft: '36px' }} value={referrerCode} onChange={e => setReferrerCode(e.target.value)} placeholder="e.g. 9876543210" required />
                </div>
              </div>
              <button type="submit" className="btn-outline" disabled={loading}>Apply Referral Code</button>
            </form>
          </div>
        )}

        {/* My Orders */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="var(--tech-cyan)" /> My Orders
          </h3>
          <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px' }}>
            Track the status of your purchased courses, products, and services.
          </p>
          {userPurchases.length === 0 ? (
            <div style={{ color: 'var(--cool-gray)', fontSize: '13px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>
              You haven't made any purchases yet.
            </div>
          ) : (
            <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '12px' }}>
              {userPurchases.map(purchase => (
                  <div key={purchase.id} className="hover-lift" style={{ minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'white', paddingRight: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{purchase.enriched_title || formatItemName(purchase.item_id)}</div>
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: String(purchase.status).toUpperCase() === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 
                                  String(purchase.status).toUpperCase() === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: String(purchase.status).toUpperCase() === 'APPROVED' ? '#10B981' : 
                             String(purchase.status).toUpperCase() === 'PENDING' ? '#F59E0B' : '#EF4444'
                    }}>
                      {String(purchase.status).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>
                    Type: <span style={{ color: 'white', textTransform: 'capitalize' }}>{purchase.item_type}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>
                    Payment ID: <span style={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '120px', verticalAlign: 'bottom' }}>{purchase.payment_id}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--cool-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Date: {new Date(purchase.created_at).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleDeletePurchase(purchase.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cool-gray)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' }}
                      title="Delete Order"
                      disabled={loading}
                      onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--cool-gray)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Referrals */}
        {currentUser?.whatsapp && (
          <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>My Referred Members</h3>
            <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '16px' }}>
              Your cell number <strong>{currentUser.whatsapp}</strong> is your referral code. Share it with friends!
            </p>
            {myReferrals.length === 0 ? (
              <div style={{ color: 'var(--cool-gray)', fontSize: '13px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                You haven't referred anyone yet.
              </div>
            ) : (
              <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '12px' }}>
                {myReferrals.map(ref => (
                  <div key={ref.id} className="hover-lift" style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                    <UserCircle size={24} color="var(--tech-cyan)" />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{ref.full_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>Joined with your code</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legal & Policies */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--tech-cyan)" /> Legal & Policies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/privacy-policy" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} color="var(--cool-gray)" /> 
                <span>Privacy Policy</span>
              </div>
              <span style={{ color: 'var(--tech-cyan)' }}>→</span>
            </a>
            <a href="/data-deletion" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={18} color="var(--cool-gray)" /> 
                <span>Data Deletion Instructions</span>
              </div>
              <span style={{ color: 'var(--tech-cyan)' }}>→</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
