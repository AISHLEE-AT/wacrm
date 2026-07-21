'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { Car, MapPin, Navigation, Clock, CheckCircle, IndianRupee, History, Star } from 'lucide-react';

const RidO = () => {
  const { currentUser } = useApp();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [searching, setSearching] = useState(false);
  const [fareEstimate, setFareEstimate] = useState<{ min: number; max: number; eta: string } | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleSearch = () => {
    if (!pickup || !dropoff) {
      showToast('Please enter both pickup and drop-off locations.', 'error');
      return;
    }
    setSearching(true);
    setFareEstimate(null);
    setTimeout(() => {
      setSearching(false);
      const min = Math.floor(Math.random() * 40) + 30;
      setFareEstimate({ min, max: min + Math.floor(min * 0.3), eta: `${Math.floor(Math.random() * 5) + 3} min` });
      showToast('Drivers found in your area! Connecting you shortly.', 'success');
    }, 2000);
  };

  return (
    <div className="animate-fade-in-up bento-grid">
      <div className="bento-item span-12 glass-panel" style={{ padding: '32px' }}>
        <h1 className="gradient-text-teal" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '32px', margin: '0 0 8px 0' }}>
          <Car size={36} /> RidO
        </h1>
        <p className="text-muted" style={{ margin: 0 }}>Book quick and reliable local rides with verified drivers in your area.</p>
      </div>

      <div className="bento-item span-12 lg-span-6 glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={20} /> Where to?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <MapPin size={20} color="var(--tech-cyan)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Pickup Location" 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '48px' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin size={20} color="#EF4444" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Drop-off Location" 
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '48px' }}
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSearch}
            disabled={searching}
            style={{ marginTop: '16px', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: 'var(--tech-cyan)', color: 'black' }}
          >
            {searching ? 'Searching for drivers...' : 'Find a Ride'}
          </button>

          {fareEstimate && (
            <div style={{ marginTop: '8px', padding: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '18px', color: '#10B981' }}>
                  <IndianRupee size={18} /> Fare Estimate
                </span>
                <span style={{ fontSize: '14px', color: 'var(--cool-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> ETA: {fareEstimate.eta}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>
                ₹{fareEstimate.min} – ₹{fareEstimate.max}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--cool-gray)' }}>Final fare depends on route and traffic conditions.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bento-item span-12 lg-span-6 glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0' }}>Why choose RidO?</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10B981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Verified Local Drivers</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>All our drivers undergo strict background checks to ensure your safety and comfort.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3B82F6' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Quick Pickups</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>Our smart routing ensures you get picked up in minutes, no matter where you are.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', color: '#F59E0B' }}>
              <Star size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Rate & Review</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>Help the community by rating your rides. Top-rated drivers earn priority assignments.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-item span-12 glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} /> Recent Rides
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--cool-gray)', fontSize: '14px' }}>
          No ride history yet. Book your first ride above!
        </div>
      </div>

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

export default RidO;
