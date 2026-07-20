'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { supabase } from '../lib/supabaseClient';
import { Users, Loader } from 'lucide-react';
import Logo from './Logo';

export default function ReferralInterceptor() {
  const { currentUser } = useApp();
  const [referralCode, setReferralCode] = useState('9344532738');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If there's no user, or if they already have a referral code, don't render anything
  if (!currentUser || currentUser.referred_by) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      setError('Please enter a referral code.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referred_by: referralCode })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
      
      // Reload the page to refresh the currentUser context
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size={50} />
        </div>
        
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'white' }}>Welcome to Aishlee!</h2>
        <p style={{ color: 'var(--cool-gray)', marginBottom: '24px', lineHeight: '1.5' }}>
          To complete your account setup and unlock the ecosystem, please enter the mobile number of the person who referred you.
        </p>

        {error && (
          <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #ff4444', padding: '12px', borderRadius: '8px', color: '#ff4444', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>
              <Users size={16} color="var(--tech-cyan)" /> Referral Code / Mobile Number
            </label>
            <input 
              type="text" 
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="input-field"
              placeholder="e.g. 9344532738"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !referralCode.trim()}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', fontSize: '16px' }}
          >
            {loading ? <Loader size={20} className="spin" /> : <Users size={20} />}
            {loading ? 'Verifying...' : 'Submit Referral & Enter App'}
          </button>
        </form>
      </div>
    </div>
  );
}
