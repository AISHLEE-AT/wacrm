'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { useApp } from './AppProvider';
import { supabase } from '../lib/supabaseClient';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const { currentUser, updateProfile } = useApp();

  // Award Points Helper
  const awardPoints = async (action, points, userId) => {
    if (!userId) return;
    try {
      // 1. Log the action
      await supabase.from('point_logs').insert({
        user_id: userId,
        action: action,
        points_awarded: points
      });

      // 2. Fetch current points and update
      const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
      const currentPoints = profile?.points || 0;
      const newPoints = currentPoints + points;

      await supabase.from('profiles').update({ points: newPoints }).eq('id', userId);
      
      // Update local state if it's the current user
      if (currentUser && currentUser.id === userId) {
        updateProfile({ points: newPoints });
      }
    } catch (err) {
      console.error('Gamification Error:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    let isActive = true;
    
    // Check if tab is active
    const handleVisibilityChange = () => {
      isActive = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Give 1 point every 60 seconds of active screen time
    const interval = setInterval(() => {
      if (isActive) {
        awardPoints('time_spent', 1, currentUser.id);
      }
    }, 60000); // 60 seconds

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  return (
    <GamificationContext.Provider value={{ awardPoints }}>
      {children}
    </GamificationContext.Provider>
  );
};
