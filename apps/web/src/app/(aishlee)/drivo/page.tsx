'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { Truck, MapPin, Package, Clock, ShieldCheck, IndianRupee, PackageCheck, Bike } from 'lucide-react';

const PACKAGE_BASE: Record<string, number> = {
  'Documents': 25, 'Small Package': 45, 'Medium Package': 80, 'Large Item': 180,
};

const DrivO = () => {
  const { currentUser } = useApp();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [packageType, setPackageType] = useState('Documents');
  const [searching, setSearching] = useState(false);
  const [estimate, setEstimate] = useState<{ cost: number; eta: string } | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleSearch = () => {
    if (!pickup || !dropoff) {
      showToast('Please enter both pickup and delivery locations.', 'error');
      return;
    }
    setSearching(true);
    setEstimate(null);
    setTimeout(() => {
      setSearching(false);
      const base = PACKAGE_BASE[packageType] || 50;
      const cost = base + Math.floor(Math.random() * 30) + 10;
      setEstimate({ cost, eta: `${Math.floor(Math.random() * 30) + 25} min` });
      showToast('Delivery drivers found in your area! Connecting you shortly.', 'success');
    }, 2000);
  };

  return (
    <div className="animate-fade-in-up bento-grid">
      <div className="bento-item span-12 glass-panel" style={{ padding: '32px' }}>
        <h1 className="gradient-text-teal" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '32px', margin: '0 0 8px 0' }}>
          <Truck size={36} /> DrivO
        </h1>
        <p className="text-muted" style={{ margin: 0 }}>Fast and secure local delivery network for your packages.</p>
      </div>

      <div className="bento-item span-12 lg-span-6 glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} /> Send a Package
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
              placeholder="Delivery Location" 
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '48px' }}
            />
          </div>

          <div>
            <select 
              value={packageType} 
              onChange={(e) => setPackageType(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="Documents">Documents</option>
              <option value="Small Package">Small Package (up to 5kg)</option>
              <option value="Medium Package">Medium Package (up to 15kg)</option>
              <option value="Large Item">Large Item (Furniture, Appliances)</option>
            </select>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSearch}
            disabled={searching}
            style={{ marginTop: '16px', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: 'var(--tech-cyan)', color: 'black' }}
          >
            {searching ? 'Finding Delivery Driver...' : 'Get Estimate'}
          </button>

          {estimate && (
            <div style={{ marginTop: '8px', padding: '20px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '18px', color: '#EAB308' }}>
                  <IndianRupee size={18} /> Delivery Estimate
                </span>
                <span style={{ fontSize: '14px', color: 'var(--cool-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> ETA: {estimate.eta}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>
                ₹{estimate.cost}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--cool-gray)' }}>
                {packageType} • Final cost depends on actual distance.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bento-item span-12 lg-span-6 glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0' }}>Why choose DrivO?</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10B981' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Secure Transport</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>Your packages are handled with care and tracked in real-time until they reach their destination.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3B82F6' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Same-Day Delivery</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>Need it there fast? Our network of drivers guarantees quick same-day delivery within the city.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'rgba(168,85,247,0.1)', borderRadius: '12px', color: '#A855F7' }}>
              <Bike size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Flexible Fleet</h4>
              <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '14px', lineHeight: '1.5' }}>From bikes to trucks — our fleet adapts to your package size for the most cost-effective delivery.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-item span-12 glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackageCheck size={20} /> Active Deliveries
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--cool-gray)', fontSize: '14px' }}>
          No active deliveries. Send your first package above!
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

export default DrivO;
