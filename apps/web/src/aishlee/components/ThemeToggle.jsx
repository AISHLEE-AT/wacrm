'use client';
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: isLight ? '#0F172A' : '#FFD700',
        transition: 'all 0.3s ease'
      }}
      title="Toggle Theme"
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
