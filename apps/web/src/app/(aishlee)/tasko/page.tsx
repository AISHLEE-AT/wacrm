// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { supabase } from '@/aishlee/lib/supabaseClient';
import { 
  CheckCircle, XCircle, Clock, BookOpen, Activity, 
  ShoppingBag, Compass, MapPin, ChevronRight, X
} from 'lucide-react';
import { createPortal } from 'react-dom';

const TaskO = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reason, setReason] = useState('');

  // Date formatted as YYYY-MM-DD for logging
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadDailyTasks();
  }, [currentUser, navigate]);

  const loadDailyTasks = async () => {
    setLoading(true);
    try {
      // 1. Fetch completed/skipped logs for today
      const { data: logsData } = await supabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'task_log')
        .eq('created_by', currentUser.id);
        
      const todayLogs = (logsData || []).filter(log => {
        try {
          const info = JSON.parse(log.additional_info || '{}');
          return info.date === todayStr;
        } catch(e) { return false; }
      });

      // 2. Fetch cross-sell items (1 Trade, 1 Tour)
      const { data: crossSellData } = await supabase
        .from('unified_master_data')
        .select('id, item_type, title_name')
        .in('item_type', ['trade', 'tour'])
        .limit(20); // Get a bunch to randomize

      const trades = (crossSellData || []).filter(item => item.item_type === 'trade');
      const tours = (crossSellData || []).filter(item => item.item_type === 'tour');
      
      const randomTrade = trades.length > 0 ? trades[Math.floor(Math.random() * trades.length)] : null;
      const randomTour = tours.length > 0 ? tours[Math.floor(Math.random() * tours.length)] : null;

      // 3. Generate Task List based on Category
      let generatedTasks = generateTasksForCategory(
        currentUser.main_category, 
        currentUser.sub_categories || [],
        randomTrade,
        randomTour
      );

      // 4. Merge with Logs
      generatedTasks = generatedTasks.map(task => {
        // Find if this task was logged today
        const log = todayLogs.find(l => l.title_name === task.id);
        if (log) {
          return {
            ...task,
            status: log.category, // 'completed' or 'skipped'
            reason: log.description
          };
        }
        return { ...task, status: 'pending', reason: null };
      });

      setTasks(generatedTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateTasksForCategory = (mainCat, subCats, randomTrade, randomTour) => {
    const defaultTasks = [];
    const isStudent = mainCat === 'Student';
    const subStr = subCats.join(' ').toLowerCase();
    
    // Core Tasks depending on type
    if (isStudent) {
      const isPolice = subStr.includes('police') || subStr.includes('army');
      
      defaultTasks.push({
        id: 'task_phys_1',
        title: isPolice ? 'Morning 2KM Run & Warmup' : '15 Mins Morning Yoga / Stretch',
        time: '06:00 AM',
        icon: Activity,
        color: '#F59E0B',
        type: 'physical'
      });

      defaultTasks.push({
        id: 'task_news_1',
        title: 'Daily News Watch & Current Affairs',
        time: '08:00 AM',
        icon: BookOpen,
        color: '#3B82F6',
        type: 'reading'
      });

      defaultTasks.push({
        id: 'task_testo_1',
        title: `Take ${isPolice ? 'Police' : 'General'} Mock Test 1`,
        time: '10:00 AM',
        icon: CheckCircle,
        color: '#10B981',
        type: 'testo',
        link: '/testo'
      });

      defaultTasks.push({
        id: 'task_phys_2',
        title: 'Evening Fitness Routine',
        time: '04:00 PM',
        icon: Activity,
        color: '#F59E0B',
        type: 'physical'
      });

      defaultTasks.push({
        id: 'task_testo_2',
        title: `Take ${isPolice ? 'Police' : 'General'} Mock Test 2`,
        time: '06:00 PM',
        icon: CheckCircle,
        color: '#10B981',
        type: 'testo',
        link: '/testo'
      });
    } else if (mainCat === 'Farmer') {
      defaultTasks.push(
        { id: 'task_farm_1', title: 'Check Weather & Soil Moisture', time: '06:00 AM', icon: MapPin, color: '#10B981', type: 'agri' },
        { id: 'task_farm_2', title: 'Review Upcoming Crop Prices', time: '02:00 PM', icon: BookOpen, color: '#3B82F6', type: 'reading', link: '/tradeo' }
      );
    } else {
      // General Professional / Employer / Trader
      defaultTasks.push(
        { id: 'task_gen_1', title: 'Review Today\'s Goals & Appointments', time: '08:00 AM', icon: BookOpen, color: '#3B82F6', type: 'planning' },
        { id: 'task_gen_2', title: 'Follow up with 3 Leads/Clients', time: '11:00 AM', icon: CheckCircle, color: '#10B981', type: 'work' },
        { id: 'task_news_1', title: 'Industry News & Market Updates', time: '04:00 PM', icon: BookOpen, color: '#3B82F6', type: 'reading' }
      );
    }

    // Cross-Sell Tasks (Everyone gets these to hit the 4-hour app open rule)
    if (randomTrade) {
      defaultTasks.push({
        id: 'task_cross_trade',
        title: `Review Recommended Product: ${randomTrade.title_name}`,
        time: '12:00 PM',
        icon: ShoppingBag,
        color: '#8B5CF6',
        type: 'tradeo',
        link: '/tradeo'
      });
    } else {
      defaultTasks.push({
        id: 'task_cross_trade_fallback',
        title: 'Explore TradeO for Useful Products',
        time: '12:00 PM',
        icon: ShoppingBag,
        color: '#8B5CF6',
        type: 'tradeo',
        link: '/tradeo'
      });
    }

    if (randomTour) {
      defaultTasks.push({
        id: 'task_cross_tour',
        title: `Check out Tour Package: ${randomTour.title_name}`,
        time: '08:00 PM',
        icon: Compass,
        color: '#EC4899',
        type: 'touro',
        link: '/touro'
      });
    } else {
      defaultTasks.push({
        id: 'task_cross_tour_fallback',
        title: 'Plan Your Next Pilgrimage on TourO',
        time: '08:00 PM',
        icon: Compass,
        color: '#EC4899',
        type: 'touro',
        link: '/touro'
      });
    }

    // Sort by time conceptually (AM then PM)
    return defaultTasks.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`);
      const timeB = new Date(`1970/01/01 ${b.time}`);
      return timeA - timeB;
    });
  };

  const handleUpdateTaskStatus = async (task, status, skipReason = null) => {
    try {
      const payload = {
        item_type: 'task_log',
        title_name: task.id, // Using ID as title to map back easily
        category: status, // 'completed' or 'skipped'
        description: skipReason || task.title,
        created_by: currentUser.id,
        additional_info: JSON.stringify({
          date: todayStr,
          task_title: task.title,
          type: task.type
        })
      };

      const { error } = await supabase.from('unified_master_data').insert([payload]);
      if (error) throw error;

      // Update Local State
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status, reason: skipReason } : t));
      
      setShowModal(false);
      setReason('');
      setSelectedTask(null);

    } catch (e) {
      alert("Failed to update task: " + e.message);
    }
  };

  const openSkipModal = (task) => {
    setSelectedTask(task);
    setReason('');
    setShowModal(true);
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="animate-fade-in-up bento-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--surface-3)', padding: '12px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
            <Activity color="#10B981" size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', margin: 0, fontWeight: '900', color: 'white' }}>TaskO</h1>
            <p style={{ fontSize: '14px', color: 'var(--cool-gray)', margin: 0 }}>
              {todayStr} • {currentUser?.main_category} {(currentUser?.sub_categories || []).length > 0 && `- ${currentUser.sub_categories.join(', ')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bento-item span-12 glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Daily Progress</span>
          <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 'bold' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: '#10B981', transition: 'width 0.5s ease-out' }}></div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--cool-gray)', margin: '8px 0 0 0' }}>
          {completedCount} of {totalCount} tasks completed today. Consistency is key!
        </p>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cool-gray)' }}>Loading your regimen...</div>
      ) : (
        <div className="bento-grid span-12" style={{ gridTemplateColumns: '1fr' }}>
          {tasks.map(task => {
            const Icon = task.icon;
            const isCompleted = task.status === 'completed';
            const isSkipped = task.status === 'skipped';
            const isPending = task.status === 'pending';

            return (
              <div key={task.id} className="bento-item span-12 glass-panel hover-lift" style={{ 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column',
                borderLeft: `4px solid ${task.color}`,
                opacity: (isCompleted || isSkipped) ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: `rgba(${task.color === '#10B981' ? '16,185,129' : task.color === '#3B82F6' ? '59,130,246' : task.color === '#F59E0B' ? '245,158,11' : task.color === '#8B5CF6' ? '139,92,246' : '236,72,153'}, 0.2)`, padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                      <Icon color={task.color} size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--cool-gray)' }}>
                        <Clock size={12} /> {task.time}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  {isCompleted && <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Done</span>}
                  {isSkipped && <span style={{ color: '#EF4444', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14}/> Skipped</span>}
                </div>

                {isSkipped && task.reason && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', fontStyle: 'italic' }}>
                    Reason: {task.reason}
                  </div>
                )}

                {/* Actions */}
                {isPending && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {task.link && (
                      <button 
                        onClick={() => navigate(task.link)}
                        className="btn-outline" 
                        style={{ padding: '8px 16px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                      >
                        Go to Page <ChevronRight size={14} />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleUpdateTaskStatus(task, 'completed')}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', flex: 1, background: '#10B981', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Mark Done
                    </button>
                    
                    <button 
                      onClick={() => openSkipModal(task)}
                      className="btn-outline" 
                      style={{ padding: '8px 16px', color: 'var(--cool-gray)', borderColor: 'var(--surface-border)', fontSize: '13px' }}
                    >
                      Cannot Do
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Skip Reason Modal */}
      {showModal && selectedTask && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-bg)', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ color: '#EF4444', margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle /> Skip Task
            </h2>
            <p style={{ color: 'var(--cool-gray)', fontSize: '14px', marginBottom: '8px' }}>
              Why are you unable to complete: <strong>{selectedTask.title}</strong>?
            </p>
            
            <textarea 
              autoFocus
              className="input-field" 
              placeholder="e.g., I am sick today..." 
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', minHeight: '100px', marginBottom: '16px', fontSize: '14px' }}
            />
            
            <button 
              className="btn-primary" 
              disabled={!reason.trim()}
              onClick={() => handleUpdateTaskStatus(selectedTask, 'skipped', reason.trim())}
              style={{ width: '100%', padding: '12px', background: reason.trim() ? '#EF4444' : 'gray', fontWeight: 'bold' }}
            >
              Submit Reason & Skip
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default TaskO;
