'use client';
import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

// Standard icons to represent the social platforms
import { Users, Video, MessageCircle, Camera } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1E293B', // Slate 800 background from the screenshot
      color: 'white',
      padding: '40px 20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      marginTop: 'auto',
      marginBottom: '70px', // Leave space for bottom nav
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', transform: 'scale(1.2)' }}>
        <Logo size={24} />
      </div>

      <p style={{ 
        color: 'rgba(255, 255, 255, 0.8)', 
        maxWidth: '400px', 
        fontSize: '14px', 
        lineHeight: '1.6',
        margin: '0 auto'
      }}>
        Empowering families with intelligent technology. Join our community and stay connected.
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
        <a href="https://wa.me/916381029380" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }} title="WhatsApp">
          <MessageCircle size={20} />
        </a>
        <a href="https://youtube.com/@AishleeTechnology" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }} title="YouTube">
          <Video size={20} />
        </a>
        <a href="https://www.facebook.com/profile.php?id=61591518780894" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }} title="Facebook">
          <Users size={20} />
        </a>
        <a href="https://www.instagram.com/aishleetechnology/?hl=en" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }} title="Instagram">
          <Camera size={20} />
        </a>
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', width: '100%', maxWidth: '400px' }}>
        <Link to="/privacy-policy" style={{ color: 'var(--tech-cyan)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</Link>
      </div>

    </footer>
  );
};

export default Footer;
