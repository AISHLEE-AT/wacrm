// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { PlayCircle, Loader, PlaySquare, ThumbsUp, MessageCircle, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { dashboardSheetsService } from '@/aishlee/services/dashboardSheetsService';

const TvO = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const data = await dashboardSheetsService.fetchYouTubeFeeds();
        setVideos(data || []);
        
        // Extract unique categories (e.g. Tamil Songs 80s, India Viral, etc.)
        if (data && data.length > 0) {
          const uniqueCategories = ['All', ...new Set(data.map(v => v.category).filter(Boolean))];
          setCategories(uniqueCategories);
          // Do not auto-play video on load so user can see the grid
        }
      } catch (err) {
        console.error("Failed to load media", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMedia();
  }, []);

  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = !searchQuery || v.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const searchSuggestions = searchQuery.trim() === '' ? [] : videos.filter(v => v.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PlaySquare color="#FF0000" size={36} />
          <div>
            <h1 style={{ fontSize: '26px', margin: 0, fontWeight: 'bold' }}>Aishlee Media</h1>
            <p className="text-muted" style={{ fontSize: '14px', margin: '4px 0 0 0' }}>Daily curated trending YouTube videos & Audio Novels</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => window.open('https://www.youtube.com/@AishleeTechnology?sub_confirmation=1', '_blank')}
            style={{ background: '#FF0000', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}
          >
            <PlaySquare size={16} /> Subscribe
          </button>
          <button 
            className="btn-outline" 
            onClick={() => window.open('https://www.youtube.com/@AishleeTechnology/community', '_blank')}
            style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <ThumbsUp size={16} /> Like
          </button>
          <button 
            className="btn-outline" 
            onClick={() => window.open('https://www.youtube.com/@AishleeTechnology/community', '_blank')}
            style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <MessageCircle size={16} /> Comment
          </button>
        </div>
      </div>

      {/* SMART SEARCH WITH AUTOCOMPLETE */}
      <div style={{ position: 'relative', display: 'flex', gap: '8px', zIndex: 100 }} onMouseLeave={() => setShowSuggestions(false)}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--cool-gray)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search Media..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px' }}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#1F2937', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 150, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              {searchSuggestions.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSearchQuery(item.title);
                    setShowSuggestions(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: idx !== searchSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s' }}
                >
                  <div>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ color: 'var(--cool-gray)', fontSize: '12px' }}>{item.category || 'Media Video'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowSuggestions(false)}
          style={{ background: 'var(--tech-cyan)', color: 'black', fontWeight: 'bold', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cool-gray)' }}>
          <Loader className="spin" size={32} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          Loading Live Curated Feeds...
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <PlaySquare size={48} color="var(--cool-gray)" style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
          <h3 style={{ color: 'white', margin: 0 }}>No Videos Found</h3>
          <p style={{ color: 'var(--cool-gray)', margin: '8px 0 0 0' }}>Please run the Apps Script to fetch YouTube data into your Google Sheet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* FLOATING MODAL PLAYER */}
          {activeVideo && createPortal(
            <div className="mobile-fullscreen-modal">
              <div className="mobile-modal-content">
                <button 
                  onClick={() => setActiveVideo(null)}
                  style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                  <iframe 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&playsinline=1`}
                    title={activeVideo.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                <div style={{ padding: '24px', background: '#111' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(255, 0, 0, 0.1)', color: '#FF0000', padding: '4px 10px', borderRadius: '16px', fontWeight: 'bold' }}>
                      {activeVideo.category}
                    </span>
                    {activeVideo.publishedAt && (
                      <span style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--cool-gray)', padding: '4px 10px', borderRadius: '16px' }}>
                        {activeVideo.publishedAt}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '22px', color: 'white', margin: '0' }}>{activeVideo.title}</h2>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* UP NEXT / CATEGORIES */}
          <div>
            <div className="sticky-top-categories" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', color: 'white', margin: 0, display: 'none' }}>Discover</h3>
              
              {/* CATEGORY CHIPS */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', width: '100%' }} className="hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      fontWeight: 'bold',
                      background: activeCategory === cat ? '#FF0000' : 'transparent',
                      color: activeCategory === cat ? 'white' : 'var(--cool-gray)',
                      border: activeCategory === cat ? '1px solid #FF0000' : '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mobile-feed-grid">
              {filteredVideos.map((video, idx) => (
                <MediaCard key={`${video.videoId}-${idx}`} video={video} onPlay={() => setActiveVideo(video)} />
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

// Premium Interactive Media Card
const MediaCard = ({ video, onPlay }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="glass-panel card-3d" 
      style={{ 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        border: expanded ? '1px solid rgba(255,0,0,0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        boxShadow: expanded ? '0 10px 30px rgba(255,0,0,0.1)' : 'none'
      }}
    >
      {/* Thumbnail Area - Click to Play */}
      <div 
        onClick={onPlay}
        style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#1a1a1a', cursor: 'pointer' }}
      >
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          onError={(e) => { e.target.src = '/logo.jpg'; }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <PlayCircle size={48} color="#FF0000" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.5))' }} />
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold', color: 'white', backdropFilter: 'blur(4px)' }}>
          {video.category}
        </div>
      </div>

      {/* Main Info */}
      <div style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'white', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.title}
        </h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--cool-gray)' }}>
            {video.publishedAt || 'Recent'}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--cool-gray)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: 0 }}
          >
            {expanded ? 'Less Info' : 'More Info'} 
            {expanded ? <ChevronUp size={14} color="#FF0000" /> : <ChevronDown size={14} color="#FF0000" />}
          </button>
        </div>
      </div>

      {/* Accordion Details */}
      <div style={{ 
        maxHeight: expanded ? '200px' : '0', 
        opacity: expanded ? 1 : 0,
        overflow: 'auto', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(0,0,0,0.4)',
        borderTop: expanded ? '1px solid rgba(255,255,255,0.05)' : 'none'
      }} className="scrollbar-thin scrollbar-thumb-slate-700">
        <div style={{ padding: '16px', fontSize: '13px', color: 'var(--cool-gray)', lineHeight: '1.6' }}>
          {video.description ? video.description : 'Explore this carefully curated media from the Thamizha Hub. Perfect for learning and entertainment!'}
        </div>
      </div>
    </div>
  );
};

export default TvO;

