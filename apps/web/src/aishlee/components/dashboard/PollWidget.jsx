'use client';
import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, Loader } from 'lucide-react';
import { useApp } from '../../context/AppProvider';
import { dataService } from '../../services/dataService';
import { submitPollVote, supabase } from '../../lib/supabaseClient';

const PollWidget = () => {
  const { currentUser, refreshUserPoints } = useApp();
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [votingError, setVotingError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPoll();
  }, [currentUser]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const activePoll = await dataService.fetchPoll();
      setPollData(activePoll);

      // Check if user has already voted
      if (currentUser && activePoll) {
        const actionName = `poll_vote_${activePoll.poll_id}`;
        const { data } = await supabase
          .from('point_logs')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('action', actionName);
          
        if (data && data.length > 0) {
          setVoted(true);
        }
      }
    } catch (err) {
      console.error("Failed to load poll", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (idx) => {
    if (!currentUser) {
      setVotingError("Please log in to vote.");
      return;
    }
    
    setVotingError('');
    setSelectedOption(idx);
    
    try {
      // Reward the points in Supabase
      const reward = pollData.points_reward || 5;
      await submitPollVote(currentUser.id, pollData.poll_id, reward);
      
      // Refresh points locally in Context so the UI updates
      if (refreshUserPoints) {
        refreshUserPoints();
      }

      setVoted(true);
      setSuccessMessage(`Awesome! You earned ${reward} points for participating!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setVotingError(err.message || 'Failed to submit vote. Try again later.');
      setSelectedOption(null);
    }
  };

  if (loading) return <div className="glass-panel" style={{ padding: '24px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cool-gray)' }}><Loader className="spin" size={24} style={{ margin: '0 auto 8px auto' }}/>Loading Poll...</div>;
  if (!pollData) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #10B981', height: '420px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
        <BarChart2 size={18} /> மக்கள் கருத்துக்கணிப்பு (Community Poll)
      </div>
      
      <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '20px', lineHeight: '1.4' }}>
        {pollData.question}
      </h3>

      {votingError && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px' }}>{votingError}</div>}
      {successMessage && <div style={{ color: '#10B981', fontSize: '13px', marginBottom: '12px', fontWeight: 'bold' }}>{successMessage}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pollData.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const percentage = voted ? Math.floor(Math.random() * 60) + 10 : 0; // Mock percentage for display

          return (
            <button
              key={idx}
              onClick={() => !voted && handleVote(idx)}
              style={{
                width: '100%',
                background: voted ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.4)',
                border: isSelected ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'left',
                cursor: voted ? 'default' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {voted && (
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', zIndex: 0 }} />
              )}
              <span style={{ position: 'relative', zIndex: 1, fontSize: '14px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                {option.text || option}
              </span>
              {voted && (
                <span style={{ position: 'relative', zIndex: 1, fontSize: '13px', color: isSelected ? '#10B981' : 'var(--cool-gray)', fontWeight: 'bold' }}>
                  {percentage}% {isSelected && <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--cool-gray)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
        <span>Points for voting: <strong style={{ color: '#10B981' }}>+{pollData.points_reward} pts</strong></span>
        <span>மொத்த வாக்குகள் (Total Votes): {voted ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 50) + 49}</span>
      </div>
    </div>
  );
};

export default PollWidget;
