'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tag, TrendingUp, AlertTriangle, Zap, ArrowRight, ShoppingCart, MessageCircle, ExternalLink } from 'lucide-react';
import { marketplaceSheetsService } from '../../services/marketplaceSheetsService';
import { ecosystemService } from '../../services/ecosystemService';
import { lmsService } from '../../services/lmsService';
import { useApp } from '../../context/AppProvider';

const QuickBusinessBulletin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
const navigate = (path) => router.push(path);
  const { currentUser } = useApp();

  useEffect(() => {
    loadBulletinItems();
  }, []);

  const loadBulletinItems = async () => {
    setLoading(true);
    try {
      // 1. Fetch Supabase Ecosystem (Cattle, Scrap, Real Estate, etc.)
      let ecosystemItems = [];
      try {
        const rawEcosystem = await ecosystemService.getListings({ status: 'APPROVED' });
        ecosystemItems = rawEcosystem.map(item => ({
          id: item.id,
          title: item.title,
          category: item.type,
          price: item.price,
          description: item.description,
          image: item.details?.image_url || 'https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=600&auto=format&fit=crop',
          date: new Date(item.created_at).getTime(),
          source: 'ecosystem',
          badge: getBadgeForEcosystem(item),
          ownerPhone: item.profiles?.whatsapp
        }));
      } catch (err) { console.error("Ecosystem fetch failed", err); }

      // 2. Fetch Supabase LMS (Courses, Quizzes)
      let lmsItems = [];
      try {
        const rawLms = await lmsService.getCourses();
        lmsItems = rawLms.map(course => ({
          id: course.id,
          title: course.title,
          category: course.type,
          price: course.price,
          description: course.content || '',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
          date: new Date(course.created_at).getTime(),
          source: 'lms',
          badge: { label: 'Offer Zone', color: '#10B981', icon: <Zap size={14} /> },
          ownerPhone: course.profiles?.whatsapp
        }));
      } catch (err) { console.error("LMS fetch failed", err); }

      // 3. Fetch Google Sheets (Verified Premium Listings)
      let sheetItems = [];
      try {
        const rawSheets = await marketplaceSheetsService.fetchListings();
        sheetItems = rawSheets.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: item.price,
          description: item.description,
          image: item.imageUrl,
          date: Date.now() - Math.random() * 86400000, // Pseudo-date for sorting recent
          source: 'sheets',
          badge: { label: 'Verified Premium', color: '#8B5CF6', icon: <TrendingUp size={14} /> },
          ownerPhone: '918072120021' // Admin phone for sheets
        }));
      } catch (err) { console.error("Sheets fetch failed", err); }

      // Combine, sort by newest, and take top 12
      const combined = [...ecosystemItems, ...lmsItems, ...sheetItems]
        .sort((a, b) => b.date - a.date)
        .slice(0, 12);

      setItems(combined);
    } catch (err) {
      console.error("Failed to aggregate bulletin:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeForEcosystem = (item) => {
    const title = item.title?.toLowerCase() || '';
    const desc = item.description?.toLowerCase() || '';
    const type = item.category?.toLowerCase() || '';
    
    if (title.includes('cattle') || title.includes('cow') || type.includes('cattle') || title.includes('scrap') || type.includes('scrap')) {
      return { label: 'Emergency Sale', color: '#EF4444', icon: <AlertTriangle size={14} /> };
    }
    return { label: 'Latest Updated', color: '#0EA5E9', icon: <Tag size={14} /> };
  };

  const handleQuickAction = (item) => {
    if (item.source === 'lms') {
      navigate('/lms');
      return;
    }
    
    // For Ecosystem & Sheets, quick WhatsApp contact
    const refCode = localStorage.getItem('active_referral');
    let text = `Hi, I saw this *${item.badge?.label || 'Item'}* on the Quick Business Bulletin:\n\n*${item.title}*\nPrice: ₹${item.price}\n\n`;
    if (refCode) text += `[Referred By: ${refCode}]\n\n`;
    text += `I am interested. Can we proceed?`;
    
    const phone = item.ownerPhone ? item.ownerPhone.replace(/\D/g, '') : '918072120021';
    window.open(`https://wa.me/${(String(phone).replace(/\D/g, '').length === 10 ? '91' + String(phone).replace(/\D/g, '') : String(phone).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)' }}>Loading Live Market Feeds...</div>;
  }

  if (items.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', borderTop: '4px solid #F59E0B', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(16, 185, 129, 0.05))', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap color="#F59E0B" size={24} />
          <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>Quick Business Bulletin</h2>
        </div>
        <button onClick={() => navigate('/ecosystem')} className="btn-outline" style={{ padding: '4px 8px', fontSize: '12px', border: 'none', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '4px' }}>
          View All <ArrowRight size={14} />
        </button>
      </div>

      <p style={{ color: 'var(--cool-gray)', fontSize: '13px', marginBottom: '20px' }}>
        Top hand-picked offers, emergency sales, and newly available courses. Act fast!
      </p>

      {/* Horizontal Scrolling Wrapper */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'thin' }}>
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} style={{ minWidth: '280px', maxWidth: '280px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${item.badge.color}40`, display: 'flex', flexDirection: 'column' }}>
            
            {/* Image */}
            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {e.target.src='https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=600&auto=format&fit=crop'}} />
              
              {/* Badge Over Image */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: item.badge.color, color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                {item.badge.icon} {item.badge.label}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: 'var(--cool-gray)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>{item.category}</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'white', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.title}
              </h3>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '16px', color: 'var(--tech-cyan)' }}>
                  {item.price > 0 ? `₹${item.price}` : 'FREE'}
                </span>
                
                <button 
                  onClick={() => handleQuickAction(item)}
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '12px', background: item.badge.color, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {item.source === 'lms' ? <><ExternalLink size={14} /> Open</> : <><MessageCircle size={14} /> Ask</>}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickBusinessBulletin;
