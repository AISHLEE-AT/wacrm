'use client';
import React from 'react';

const Logo = ({ size = 24, className = "" }) => {
  // Multiply size so horizontal text remains legible
  const logoHeight = Math.max(size * 1.6, 36);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <img 
        src="/logo.jpg" 
        alt="Thamizhan" 
        style={{ 
          height: `${logoHeight}px`, 
          width: 'auto', 
          borderRadius: '8px', 
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))', // Immersive green glow
          mixBlendMode: 'lighten' // Helps blend the black background of the JPG into the page background
        }} 
      />
      <div style={{
        marginTop: '6px',
        fontWeight: '900',
        fontSize: `${Math.max(size * 0.45, 12)}px`,
        letterSpacing: '0.5px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8)) drop-shadow(0px 1px 4px rgba(255,255,255,0.2))',
        textTransform: 'uppercase',
        fontFamily: 'system-ui, sans-serif'
      }}>
        AISHLEE TECHNOLOGY
      </div>
    </div>
  );
};

export default Logo;
