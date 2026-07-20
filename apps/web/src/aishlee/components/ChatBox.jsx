'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppProvider';
import { ecosystemService } from '../services/ecosystemService';
import { Send, UserCircle } from 'lucide-react';

export default function ChatBox({ listingId }) {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time updates
    const subscription = ecosystemService.subscribeToMessages(listingId, (newMsg) => {
      // In real-time payload, relations (like profiles) aren't eager loaded
      // We do a quick reload or append with a basic structure
      loadMessages();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [listingId]);

  const loadMessages = async () => {
    try {
      const data = await ecosystemService.getMessages(listingId);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return alert("Please type a message before sending.");

    try {
      await ecosystemService.sendMessage(listingId, currentUser.id, newMessage);
      setNewMessage('');
      // message will auto-load via realtime subscription
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--cool-gray)' }}>Loading chat...</div>;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '400px', 
      background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--surface-border)'
    }}>
      {/* Chat History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--cool-gray)', marginTop: 'auto', marginBottom: 'auto' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} style={{ 
                display: 'flex', 
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <UserCircle size={24} color={isMe ? 'var(--tech-cyan)' : 'var(--tech-teal)'} />
                <div style={{
                  background: isMe ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: isMe ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid var(--surface-border)',
                  maxWidth: '80%'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--cool-gray)', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>
                      {msg.profiles?.full_name} {msg.profiles?.role === 'Admin' || msg.profiles?.role === 'Super Admin' ? '⭐ (Admin)' : ''}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.profiles?.whatsapp && !isMe && (
                      <a 
                        href={`https://wa.me/${(String(msg.profiles.whatsapp.replace(/\D/g, '')).replace(/\D/g, '').length === 10 ? '91' + String(msg.profiles.whatsapp.replace(/\D/g, '')).replace(/\D/g, '') : String(msg.profiles.whatsapp.replace(/\D/g, '')).replace(/\D/g, ''))}?text=Hi! I am messaging regarding our Ecosystem listing chat.`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#25D366', textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: 'white', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Box */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-field"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 16px' }} disabled={!newMessage.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
