'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { notificationService } from '../services/notificationService';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export default function NotificationBell() {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifs = async () => {
      const data = await notificationService.getUserNotifications(currentUser.id);
      setNotifications(data || []);
    };

    fetchNotifs();
    
    // Subscribe to real-time updates for new notifications
    const channel = supabase.channel(`notifications-${currentUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(currentUser.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline hover-glow"
        style={{ position: 'relative', background: 'transparent', border: 'none', padding: '8px', color: 'white' }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 90 }} 
          />
          <div className="glass-panel animate-fade-in" style={{
            position: 'absolute',
            top: '50px',
            right: '-10px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'var(--surface-bg)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            zIndex: 100,
            padding: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  style={{ background: 'transparent', border: 'none', color: 'var(--tech-cyan)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p style={{ color: 'var(--cool-gray)', textAlign: 'center', margin: '24px 0' }}>No notifications yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ 
                    background: notif.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(0, 234, 255, 0.05)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    borderLeft: notif.is_read ? '2px solid transparent' : '2px solid var(--tech-cyan)',
                    position: 'relative'
                  }}>
                    <h4 style={{ margin: '0 0 4px 0', color: notif.is_read ? 'var(--cool-gray)' : 'white', fontSize: '14px' }}>{notif.title}</h4>
                    <p style={{ margin: 0, color: 'var(--cool-gray)', fontSize: '12px', lineHeight: '1.4' }}>{notif.message}</p>
                    <span style={{ display: 'block', marginTop: '8px', color: 'var(--surface-border)', fontSize: '10px' }}>
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                    
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(e, notif.id)}
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--cool-gray)', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
