'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { dashboardSheetsService } from '../services/dashboardSheetsService';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('/');
  const [allUsers, setAllUsers] = useState([]);
  const [theme, setTheme] = useState((typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('app_theme') || 'dark' : 'dark');

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('app_theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const initializeUser = async (user) => {
    try {
      // Fetch role from profiles table
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      let forcedRole = profile?.role || user.user_metadata?.role || 'User';
      let fullName = profile?.full_name || user.user_metadata?.full_name || 'User';
      let referredBy = profile?.referred_by || user.user_metadata?.referred_by || null;
      let whatsapp = profile?.whatsapp || null;
      
      // Resume Fields
      let location = profile?.location || null;
      let education_level = profile?.education_level || null;
      let employment_status = profile?.employment_status || null;
      let skills = profile?.skills || null;
      let political_interest = profile?.political_interest || null;
      let bio = profile?.bio || null;
      let avatar_url = profile?.avatar_url || null;
      let permanent_pincode = profile?.permanent_pincode || null;
      
      // New Onboarding Fields
      let dob = profile?.dob || null;
      let gender = profile?.gender || null;
      let aadhar_number = profile?.aadhar_number || null;
      let guardian_name = profile?.guardian_name || null;
      let address = profile?.address || null;
      let institution_name = profile?.institution_name || null;
      let experience_years = profile?.experience_years || null;
      let income_range = profile?.income_range || null;
      let business_name = profile?.business_name || null;
      let gst_number = profile?.gst_number || null;
      let land_size = profile?.land_size || null;
      let primary_crop = profile?.primary_crop || null;

      if (user.email === 'aishleeraadee@gmail.com') forcedRole = 'Super Admin';
      if (user.email === 'rajakumaranaap@gmail.com') forcedRole = 'User';

      // Ensure profile exists in database
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        role: forcedRole,
        referred_by: referredBy,
        ...(whatsapp ? { whatsapp } : {})
      });

      setCurrentUser({
        id: user.id,
        email: user.email,
        fullName: fullName,
        role: forcedRole,
        whatsapp,
        referred_by: referredBy,
        allotted_to: profile?.allotted_to || null,
        points: profile?.points || 0,
        location,
        education_level,
        employment_status,
        skills,
        political_interest,
        bio,
        avatar_url,
        permanent_pincode,
        dob,
        gender,
        aadhar_number,
        guardian_name,
        address,
        institution_name,
        experience_years,
        income_range,
        business_name,
        gst_number,
        land_size,
        primary_crop,
        main_category: profile?.main_category || null,
        sub_categories: profile?.sub_categories || []
      });
    } catch (err) {
      console.error("Error initializing user:", err);
      // Fallback
      setCurrentUser({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || 'User',
        role: 'User'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initializeUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initializeUser(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchUserRole = async (role) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const refreshUserPoints = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from('profiles').select('points').eq('id', currentUser.id).single();
    if (data) {
      setCurrentUser(prev => ({ ...prev, points: data.points }));
    }
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      setAllUsers(data);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
      fetchAllUsers();
    }
  }, [currentUser?.role]);

  const adminChangeUserRole = async (userId, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      fetchAllUsers(); // refresh list
      if (userId === currentUser.id) {
        setCurrentUser(prev => ({ ...prev, role: newRole }));
      }
    } else {
      console.error("Failed to change role:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (currentUser?.role === 'Super Admin') {
      const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour
      
      // Optional: Initial sync if it hasn't been synced recently
      const lastSync = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('last_auto_sync') : null;
      if (!lastSync || Date.now() - parseInt(lastSync) > SYNC_INTERVAL) {
        dashboardSheetsService.importToSupabase(supabase).then(() => {
          if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('last_auto_sync', Date.now().toString());
        }).catch(err => console.error("Auto-sync failed on init:", err));
      }

      interval = setInterval(() => {
        console.log("Running hourly auto-sync...");
        dashboardSheetsService.importToSupabase(supabase).then(() => {
          if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('last_auto_sync', Date.now().toString());
        }).catch(err => console.error("Auto-sync failed:", err));
      }, SYNC_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser]);

  const assignUserToAdmin = async (userId, adminId) => {
    const { error } = await supabase.from('profiles').update({ allotted_to: adminId }).eq('id', userId);
    if (!error) {
      fetchAllUsers();
    } else {
      console.error("Failed to assign user:", error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;

    if (updates.whatsapp) {
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('whatsapp', updates.whatsapp)
        .neq('id', currentUser.id);

      if (checkError) {
        console.error("Error checking whatsapp uniqueness:", checkError);
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("This WhatsApp number is already registered to another user.");
      }
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', currentUser.id);
    if (!error) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    } else {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'System Online', body: 'THAMIZHA Web platform is active.', isRead: false }
  ]);

  const value = {
    currentUser,
    switchUserRole,
    activeTab,
    setActiveTab,
    notifications,
    setNotifications,
    allUsers,
    adminChangeUserRole,
    assignUserToAdmin,
    logout,
    updateProfile,
    theme,
    toggleTheme,
    refreshUserPoints
  };

  return (
    <AppContext.Provider value={value}>
      {!loading && children}
    </AppContext.Provider>
  );
};
