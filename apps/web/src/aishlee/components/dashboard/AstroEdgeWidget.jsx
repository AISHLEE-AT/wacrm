'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Target, Loader } from 'lucide-react';
import { useApp } from '../../context/AppProvider';
import { astroService } from '../../services/astroService';

const AstroEdgeWidget = () => {
  const { currentUser } = useApp();
  const [selectedRasi, setSelectedRasi] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const rasis = astroService.getAllRasis();

  useEffect(() => {
    // Load saved rasi from local storage
    const savedRasi = localStorage.getItem('user_rasi');
    if (savedRasi && rasis.includes(savedRasi)) {
      setSelectedRasi(savedRasi);
    }
  }, []);

  useEffect(() => {
    if (selectedRasi) {
      loadPrediction(selectedRasi);
      localStorage.setItem('user_rasi', selectedRasi);
    }
  }, [selectedRasi]);

  const loadPrediction = async (rasi) => {
    setLoading(true);
    try {
      const data = await astroService.getDailyPrediction(rasi, currentUser?.fullName || "User");
      setPredictionData(data);
    } catch (err) {
      console.error("Failed to load astro prediction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #F59E0B', position: 'relative', height: '420px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'scale(1.5)' }}>
        <Sparkles size={120} color="#F59E0B" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
        <Sparkles size={18} /> AstroEdge (Daily Teller)
      </div>
      
      <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--cool-gray)', marginBottom: '8px', fontWeight: 'bold' }}>Select Your Rasi (ராசி)</label>
        <select 
          value={selectedRasi}
          onChange={(e) => setSelectedRasi(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid rgba(245, 158, 11, 0.3)', 
            borderRadius: '8px',
            color: 'white',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          <option value="" disabled>-- Select Rasi --</option>
          {rasis.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#F59E0B' }}>
          <Loader className="spin" size={24} style={{ margin: '0 auto' }} />
          <div style={{ fontSize: '12px', marginTop: '8px' }}>Reading the stars...</div>
        </div>
      )}

      {!loading && predictionData && selectedRasi && (
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0,0,0,0.2))', 
            borderLeft: '3px solid #F59E0B', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' }}>
              " {predictionData.prediction} "
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={20} color="#10B981" />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>Lucky Number</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{predictionData.luckyNumber}</div>
              </div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={20} color="#F59E0B" />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>Lucky Color</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{predictionData.luckyColor}</div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '10px', color: 'var(--cool-gray)' }}>
            Auto-Updated for: {predictionData.date}
          </div>
        </div>
      )}

      {!loading && !selectedRasi && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--cool-gray)', fontSize: '13px' }}>
          Please select your Rasi to see today's prediction.
        </div>
      )}

    </div>
  );
};

export default AstroEdgeWidget;
