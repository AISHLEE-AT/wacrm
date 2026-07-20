'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useApp } from './AppProvider';
import { supabase } from '../lib/supabaseClient';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const { currentUser } = useApp();
  // Buffer points locally and flush to DB every 5 minutes (single RPC call = 1 egress unit)
  const pendingPoints = useRef(0);

  // Award Points Helper - now fully optimistic with buffering
  const awardPoints = async (action, points, userId) => {
    if (!userId) return;
    // Buffer points locally to reduce DB writes
    pendingPoints.current += points;
  };

  // Flush buffered points to DB - single atomic RPC call = minimal egress
  const flushPoints = async () => {
    if (!currentUser || pendingPoints.current <= 0) return;
    const pts = pendingPoints.current;
    pendingPoints.current = 0; // Clear immediately to prevent double-flush
    try {
      // Single RPC call replaces 2 separate DB calls (select + update)
      // The RPC atomically increments points in the DB
      const { error } = await supabase.rpc('increment_user_points', {
        p_user_id: currentUser.id,
        p_action: 'time_spent',
        p_points: pts
      });
      if (error) {
        // If RPC fails, restore points to retry next flush
        pendingPoints.current += pts;
        console.error('Points flush error:', error);
      }
    } catch (err) {
      pendingPoints.current += pts; // restore for retry
      console.error('Gamification flush error:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    let isActive = document.visibilityState === 'visible';

    // Check if tab is active
    const handleVisibilityChange = () => {
      isActive = document.visibilityState === 'visible';
      // Flush to DB when user tabs away (good moment to save)
      if (!isActive) flushPoints();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Buffer 5 points every 5 min (no DB write yet)
    const bufferInterval = setInterval(() => {
      if (isActive) {
        pendingPoints.current += 5;
      }
    }, 300000); // 5 minutes

    // Flush to DB once every 30 minutes (was 2 calls every 5 min = 24 calls/2hr → now 2 calls/hr)
    const flushInterval = setInterval(flushPoints, 1800000); // 30 minutes

    return () => {
      clearInterval(bufferInterval);
      clearInterval(flushInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Flush remaining points on unmount
      flushPoints();
    };
  }, [currentUser?.id]);

  return (
    <GamificationContext.Provider value={{ awardPoints }}>
      {children}
    </GamificationContext.Provider>
  );
};
