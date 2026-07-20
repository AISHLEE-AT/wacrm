'use client';
import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Thermometer, AlertTriangle, Cloud, Loader } from 'lucide-react';
import { weatherService } from '../../services/weatherService';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      const data = await weatherService.getTNWeather();
      setWeatherData(data);
      setLoading(false);
    }
    loadWeather();
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '24px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cool-gray)' }}><Loader className="spin" size={24} style={{ margin: '0 auto 8px auto' }}/>Loading Agri-Weather...</div>;
  if (!weatherData) return null;

  // Determine alert box styling
  let alertBg = 'rgba(16, 185, 129, 0.1)';
  let alertColor = '#10B981';
  let AlertIcon = Cloud;
  
  if (weatherData.alertLevel === 'danger') {
    alertBg = 'rgba(239, 68, 68, 0.1)';
    alertColor = '#EF4444';
    AlertIcon = AlertTriangle;
  } else if (weatherData.alertLevel === 'warning') {
    alertBg = 'rgba(245, 158, 11, 0.1)';
    alertColor = '#F59E0B';
    AlertIcon = AlertTriangle;
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #3B82F6', position: 'relative', height: '420px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
        <Thermometer size={18} /> வேளாண் வானிலை (Agri-Weather)
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', lineHeight: '1', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
            {weatherData.currentTemp}°<span style={{ fontSize: '16px', color: 'var(--cool-gray)', marginTop: '4px' }}>C</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--cool-gray)', marginTop: '4px' }}>தமிழ்நாடு (TN)</div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>High</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>{weatherData.maxTemp}°</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>Low</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3B82F6' }}>{weatherData.minTemp}°</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CloudRain size={20} color="#3B82F6" />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>மழை வாய்ப்பு</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{weatherData.rainProbability}%</div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wind size={20} color="#9CA3AF" />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--cool-gray)', textTransform: 'uppercase' }}>காற்று</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{weatherData.windSpeed} km/h</div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: alertBg, 
        border: `1px solid ${alertColor}`, 
        padding: '12px 16px', 
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <AlertIcon color={alertColor} size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ color: alertColor, fontSize: '13px', fontWeight: 'bold', lineHeight: '1.5' }}>
          {weatherData.alertMsg}
        </div>
      </div>
      
      <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '10px', color: 'var(--cool-gray)' }}>
        Live Feed provided by OpenMeteo (Free)
      </div>

    </div>
  );
};

export default WeatherWidget;
