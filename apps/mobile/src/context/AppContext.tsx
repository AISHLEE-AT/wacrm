// @ts-nocheck
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Admin phone numbers (same as web app)
export const ADMIN_PHONES = ['6381029380', '9876543210', '9486335870'];

export interface AppUser {
  id?: string;
  phone: string;
  name: string;
  role: string;       // e.g. 'admin' | 'user' | 'driver' | 'Teacher' etc.
  category: string;   // e.g. 'Admin' | 'Traveller' | 'Driver' etc.
  isAdmin: boolean;
  accessToken: string | null;
  refreshToken?: string | null;
  defaultModule?: string | null;
  selectedModule?: string | null;
  upiId?: string;
  avatarUrl?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
  profileComplete?: boolean;
}

export const AppContext = createContext<any>(null);

import { supabase } from '../lib/supabase';
import { applyThemeToGlobalColors, applyModeToGlobalColors, themeVersion as _themeVersion } from '../lib/theme';

export const AppProvider = ({ children }: any) => {
  const [recentModules, setRecentModules] = useState<string[]>(['Map']);
  const [pinnedModules, setPinnedModules] = useState<string[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [lastWhatsAppSync, setLastWhatsAppSync] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  // Theme state
  const [themeMode, setThemeModeState] = useState<'light'|'dark'>('dark');
  const [themeAccent, setThemeAccentState] = useState<string>('Teal');
  const [themeVer, setThemeVer] = useState(0);

  const setThemeMode = useCallback(async (mode: 'light'|'dark') => {
    setThemeModeState(mode);
    applyModeToGlobalColors(mode);
    // Re-apply accent so primary/accent opacities are recalculated for the new mode
    setThemeAccentState(prev => {
      applyThemeToGlobalColors(prev);
      return prev;
    });
    setThemeVer(v => v + 1);
    await SecureStore.setItemAsync('theme-mode', mode);
  }, []);

  const setThemeAccent = useCallback(async (accent: string) => {
    setThemeAccentState(accent);
    applyThemeToGlobalColors(accent);
    setThemeVer(v => v + 1);
    await SecureStore.setItemAsync('theme-accent', accent);
  }, []);

  // Derived shorthand for components still using userRole
  const userRole = user?.isAdmin ? 'admin' : (user?.role ?? 'user');
  const isAdmin = user?.isAdmin ?? false;

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedModules = await SecureStore.getItemAsync('recent-modules');
        if (savedModules) setRecentModules(JSON.parse(savedModules));

        const savedPinned = await SecureStore.getItemAsync('user-pinned-modules');
        if (savedPinned) setPinnedModules(JSON.parse(savedPinned));

        const savedThemeMode = await SecureStore.getItemAsync('theme-mode');
        if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
          setThemeModeState(savedThemeMode);
          applyModeToGlobalColors(savedThemeMode);
        }

        const savedThemeAccent = await SecureStore.getItemAsync('theme-accent');
        if (savedThemeAccent) {
          setThemeAccentState(savedThemeAccent);
          applyThemeToGlobalColors(savedThemeAccent);
        }
        setThemeVer(v => v + 1);

        const phone = await SecureStore.getItemAsync('user-phone');
        let name = await SecureStore.getItemAsync('user-name');
        const role = await SecureStore.getItemAsync('user-role');
        const category = await SecureStore.getItemAsync('user-category');
        let accessToken = await SecureStore.getItemAsync('sb-access-token');
        let refreshToken = await SecureStore.getItemAsync('sb-refresh-token');
        const apiKey = await SecureStore.getItemAsync('gemini-api-key');
        let defaultModule = await SecureStore.getItemAsync('user-default-module');
        const selectedModule = await SecureStore.getItemAsync('user-selected-module');
        const onboardingDone = await SecureStore.getItemAsync('onboarding-complete');
        let upiId = await SecureStore.getItemAsync('user-upi-id');
        let avatarUrl = await SecureStore.getItemAsync('user-avatar-url');
        let location = await SecureStore.getItemAsync('user-location');
        let latStr = await SecureStore.getItemAsync('user-latitude');
        let lngStr = await SecureStore.getItemAsync('user-longitude');

        setOnboardingComplete(onboardingDone === 'true');

        if (phone) {
          const cleanPhone = phone.replace(/\D/g, '').slice(-10);
          const adminStatus = ADMIN_PHONES.includes(phone) || ADMIN_PHONES.includes(cleanPhone) || role === 'admin' || category === 'Admin';

          // Fetch the full profile from Supabase to sync across all devices with 2s safety timeout
          try {
            if (accessToken) {
              const sessionRes: any = await Promise.race([
                supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
              ]).catch(() => ({ data: null, error: null }));

              if (sessionRes?.data?.session?.access_token) {
                accessToken = sessionRes.data.session.access_token;
                refreshToken = sessionRes.data.session.refresh_token || refreshToken;
                await SecureStore.setItemAsync('sb-access-token', accessToken);
                if (refreshToken) {
                  await SecureStore.setItemAsync('sb-refresh-token', refreshToken);
                }
              }
            }

            const fetchProfilePromise = supabase
              .from('profiles')
              .select('*')
              .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            const profileRes: any = await Promise.race([
              fetchProfilePromise,
              new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 2000))
            ]).catch(() => ({ data: null, error: null }));

            const prof = profileRes?.data;

            let serverSyncTime = 0;
            if (prof) {
              if (prof.full_name) {
                name = prof.full_name;
                await SecureStore.setItemAsync('user-name', prof.full_name);
              }
              const clean10 = (phone || '').replace(/\D/g, '').slice(-10);
              const defaultUpi = clean10 ? `${clean10}@upi` : '';
              if (prof.upi_id) {
                upiId = prof.upi_id;
                await SecureStore.setItemAsync('user-upi-id', prof.upi_id);
              } else if (defaultUpi) {
                upiId = defaultUpi;
                await SecureStore.setItemAsync('user-upi-id', defaultUpi);
                supabase
                  .from('profiles')
                  .update({ upi_id: defaultUpi })
                  .eq('id', prof.id)
                  .then(
                    () => {},
                    () => {}
                  );
              }
              if (prof.avatar_url) {
                avatarUrl = prof.avatar_url;
                await SecureStore.setItemAsync('user-avatar-url', prof.avatar_url);
              }
              if (prof.location) {
                location = prof.location;
                await SecureStore.setItemAsync('user-location', prof.location);
              }
              if (prof.latitude) {
                latStr = String(prof.latitude);
                await SecureStore.setItemAsync('user-latitude', latStr);
              }
              if (prof.longitude) {
                lngStr = String(prof.longitude);
                await SecureStore.setItemAsync('user-longitude', lngStr);
              }
              if (prof.gemini_api_key) {
                await SecureStore.setItemAsync('gemini-api-key', prof.gemini_api_key);
                setGeminiApiKey(prof.gemini_api_key);
              }
              if (prof.default_module) {
                defaultModule = prof.default_module;
                await SecureStore.setItemAsync('user-default-module', defaultModule);
              }
              if (prof.last_whatsapp_inbound_at) {
                const parsed = new Date(prof.last_whatsapp_inbound_at).getTime();
                if (!isNaN(parsed) && parsed > 0) {
                  serverSyncTime = parsed;
                }
              }
            }

            // Sync 24-Hour WhatsApp CRM Session Timestamp
            // The server timestamp (last_whatsapp_inbound_at / conversations) is authoritative
            let finalSyncTime = 0;
            if (serverSyncTime > 0) {
              finalSyncTime = serverSyncTime;
            } else {
              // Fallback: check recent conversations if profile has no timestamp
              try {
                const { data: convData } = await supabase
                  .from('conversations')
                  .select('last_message_at, updated_at, contact:contacts!inner(phone)')
                  .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`, { foreignTable: 'contacts' })
                  .order('last_message_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                const convTime = convData?.last_message_at || convData?.updated_at;
                if (convTime) {
                  const parsed = new Date(convTime).getTime();
                  if (!isNaN(parsed) && parsed > 0) {
                    finalSyncTime = parsed;
                    if (prof?.id) {
                      supabase.from('profiles').update({
                        last_whatsapp_inbound_at: new Date(parsed).toISOString()
                      }).eq('id', prof.id).then(() => {}, () => {});
                    }
                  }
                }
              } catch (_) {}

              if (finalSyncTime <= 0) {
                const savedSync = await SecureStore.getItemAsync('last-whatsapp-sync-timestamp');
                const parsedSaved = savedSync ? parseInt(savedSync, 10) : 0;
                // Only use savedSync if it's within a valid historical window (< 24h old)
                if (parsedSaved > 0 && (Date.now() - parsedSaved) < 24 * 60 * 60 * 1000) {
                  finalSyncTime = parsedSaved;
                }
              }
            }

            if (finalSyncTime > 0) {
              setLastWhatsAppSync(finalSyncTime);
              await SecureStore.setItemAsync('last-whatsapp-sync-timestamp', finalSyncTime.toString());
            } else {
              setLastWhatsAppSync(null);
              await SecureStore.deleteItemAsync('last-whatsapp-sync-timestamp');
            }
          } catch(e) {}

          let effectiveRole = role ?? 'user';
          let effectiveCategory = category ?? 'Traveller';
          if (adminStatus || prof?.role === 'admin' || prof?.main_category === 'Admin') {
            effectiveRole = 'admin';
            effectiveCategory = 'Admin';
            await SecureStore.setItemAsync('user-role', 'admin');
            await SecureStore.setItemAsync('user-category', 'Admin');
          } else if (prof) {
            if (prof.role) {
              effectiveRole = prof.role;
              await SecureStore.setItemAsync('user-role', prof.role);
            }
            if (prof.main_category) {
              effectiveCategory = prof.main_category;
              await SecureStore.setItemAsync('user-category', prof.main_category);
            }
          }

          setUser({
            phone,
            name: name ?? '',
            role: effectiveRole,
            category: effectiveCategory,
            isAdmin: adminStatus || effectiveRole === 'admin' || effectiveCategory === 'Admin',
            accessToken,
            refreshToken,
            defaultModule,
            selectedModule,
            upiId: upiId || '',
            avatarUrl: avatarUrl || '',
            location: location || '',
            latitude: latStr ? parseFloat(latStr) : null,
            longitude: lngStr ? parseFloat(lngStr) : null,
            profileComplete: !!name && !!location,
          });

          // Background sync API key from server across all devices
          fetch(`https://watscrm.vercel.app/api/auth/check?phone=${phone}`)
            .then(res => res.json())
            .then(data => {
              if (data.gemini_api_key && data.gemini_api_key !== apiKey) {
                setGeminiApiKey(data.gemini_api_key);
                SecureStore.setItemAsync('gemini-api-key', data.gemini_api_key);
              }
            })
            .catch(() => {});
        }
        if (apiKey) setGeminiApiKey(apiKey);

        const savedSync = await SecureStore.getItemAsync('last-whatsapp-sync-timestamp');
        if (savedSync && !lastWhatsAppSync) {
          setLastWhatsAppSync(parseInt(savedSync, 10));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  // Listen for background Supabase auth token refreshes and persist to SecureStore
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        await SecureStore.setItemAsync('sb-access-token', session.access_token);
        if (session.refresh_token) {
          await SecureStore.setItemAsync('sb-refresh-token', session.refresh_token);
        }
        setUser(prev => prev ? {
          ...prev,
          accessToken: session.access_token,
          refreshToken: session.refresh_token || prev.refreshToken
        } : null);
      }
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (userData: Partial<AppUser> & { geminiApiKey?: string }) => {
    const phone = userData.phone ?? '';
    const adminStatus =
      ADMIN_PHONES.includes(phone) ||
      userData.role === 'admin' ||
      userData.category === 'Admin';

    const fullUser: AppUser = {
      phone,
      name: userData.name ?? '',
      role: userData.role ?? 'user',
      category: userData.category ?? 'Traveller',
      isAdmin: adminStatus,
      accessToken: userData.accessToken ?? null,
      refreshToken: userData.refreshToken ?? null,
      selectedModule: userData.selectedModule ?? null,
      upiId: userData.upiId ?? '',
      avatarUrl: userData.avatarUrl ?? '',
      location: userData.location ?? '',
      latitude: userData.latitude ?? null,
      longitude: userData.longitude ?? null,
      profileComplete: !!(userData.name && userData.location),
    };

    setUser(fullUser);

    // ─── 24h WhatsApp Window: Preserve true server timestamp ───
    // Real WhatsApp interactions (OTP verification, keep-alive ping) renew the window.
    // PIN or Biometric logins preserve the real timestamp without faking Date.now().
    if (userData.last_whatsapp_inbound_at) {
      const ts = new Date(userData.last_whatsapp_inbound_at).getTime();
      if (!isNaN(ts) && ts > 0) {
        setLastWhatsAppSync(ts);
        await SecureStore.setItemAsync('last-whatsapp-sync-timestamp', ts.toString());
      }
    } else {
      const savedSync = await SecureStore.getItemAsync('last-whatsapp-sync-timestamp');
      const existingSyncTime = savedSync ? parseInt(savedSync, 10) : 0;
      if (existingSyncTime > 0) {
        setLastWhatsAppSync(existingSyncTime);
      }
    }

    await SecureStore.setItemAsync('user-phone', phone);
    await SecureStore.setItemAsync('user-name', fullUser.name);
    await SecureStore.setItemAsync('user-role', fullUser.role);
    await SecureStore.setItemAsync('user-category', fullUser.category);
    if (fullUser.upiId) await SecureStore.setItemAsync('user-upi-id', fullUser.upiId);
    if (fullUser.avatarUrl) await SecureStore.setItemAsync('user-avatar-url', fullUser.avatarUrl);
    if (fullUser.location) await SecureStore.setItemAsync('user-location', fullUser.location);
    if (fullUser.latitude) await SecureStore.setItemAsync('user-latitude', String(fullUser.latitude));
    if (fullUser.longitude) await SecureStore.setItemAsync('user-longitude', String(fullUser.longitude));

    // Note: Supabase profile last_whatsapp_inbound_at is NOT updated here.
    // It is only updated via recordWhatsAppSync() when a real WhatsApp
    // interaction occurs (OTP login or keep-alive ping), keeping the DB
    // in sync with what the admin CRM shows.
    if (fullUser.accessToken) {
      await SecureStore.setItemAsync('sb-access-token', fullUser.accessToken);
    }
    if (fullUser.refreshToken) {
      await SecureStore.setItemAsync('sb-refresh-token', fullUser.refreshToken);
    }
    if (userData.geminiApiKey) {
      setGeminiApiKey(userData.geminiApiKey);
      await SecureStore.setItemAsync('gemini-api-key', userData.geminiApiKey);
    }
    if (userData.selectedModule) {
      await SecureStore.setItemAsync('user-selected-module', userData.selectedModule);
    }
    
    // Sync the Supabase client session natively
    if (fullUser.accessToken) {
      await supabase.auth.setSession({
        access_token: fullUser.accessToken,
        refresh_token: fullUser.refreshToken || '',
      });
    }
  }, []);

  // ─── USER PRESENCE & ACTIVE SESSION HEARTBEAT (Every 45s) ───
  useEffect(() => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);

    const sendHeartbeat = async () => {
      try {
        const nowIso = new Date().toISOString();
        // 1. Keep profile active in Supabase
        await supabase
          .from('profiles')
          .update({ updated_at: nowIso })
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);

        // 2. If user is a driver partner, ensure active online status
        if (user.role === 'driver' || user.category === 'Driver') {
          await supabase
            .from('drivers')
            .update({ 
              status: 'online', 
              is_online: true, 
              updated_at: nowIso,
              ...(user.latitude && user.longitude ? {
                pickup_latitude: user.latitude,
                pickup_longitude: user.longitude,
                current_lat: user.latitude,
                current_lng: user.longitude,
              } : {})
            })
            .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`);
        }
      } catch (err) {
        console.warn('Presence heartbeat error:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000);
    return () => clearInterval(interval);
  }, [user?.phone, user?.role, user?.category, user?.latitude, user?.longitude]);

  const signOut = useCallback(async () => {
    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
      supabase
        .from('drivers')
        .update({ status: 'offline', is_online: false, updated_at: new Date().toISOString() })
        .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
        .then(() => {});
    }
    setUser(null);
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('sb-refresh-token');
    await SecureStore.deleteItemAsync('user-phone');
    await SecureStore.deleteItemAsync('user-name');
    await SecureStore.deleteItemAsync('user-role');
    await SecureStore.deleteItemAsync('user-category');
    await SecureStore.deleteItemAsync('gemini-api-key');
    await SecureStore.deleteItemAsync('user-selected-module');
    await SecureStore.deleteItemAsync('user-pinned-modules');
    await SecureStore.deleteItemAsync('onboarding-complete');
    setOnboardingComplete(false);
    
    // Clear Supabase client session natively
    await supabase.auth.signOut();
  }, [user?.phone]);

  const addRecentModule = useCallback(async (moduleName: string) => {
    let updated = [moduleName, ...recentModules.filter(m => m !== moduleName)];
    if (updated.length > 3) updated = updated.slice(0, 3);
    setRecentModules(updated);
    await SecureStore.setItemAsync('recent-modules', JSON.stringify(updated));
  }, [recentModules]);

  const setSelectedModule = useCallback(async (modulePath: string) => {
    setUser(prev => prev ? { ...prev, selectedModule: modulePath } : null);
    await SecureStore.setItemAsync('user-selected-module', modulePath);
  }, []);

  const togglePinnedModule = useCallback(async (moduleId: string) => {
    setPinnedModules(prev => {
      let newPinned = [...prev];
      if (newPinned.includes(moduleId)) {
        newPinned = newPinned.filter(id => id !== moduleId);
      } else {
        if (newPinned.length < 2) {
          newPinned.push(moduleId);
        }
      }
      SecureStore.setItemAsync('user-pinned-modules', JSON.stringify(newPinned));
      return newPinned;
    });
  }, []);

  // Realtime subscription for Profile & UPI sync across the entire app
  useEffect(() => {
    if (!user?.phone) return;
    const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
    
    const profileChannel = supabase
      .channel(`profile-realtime-${cleanPhone}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload: any) => {
          const updated = payload.new;
          if (!updated) return;
          const updatedPhone = (updated.phone || updated.whatsapp || '').replace(/\D/g, '').slice(-10);
          if (updatedPhone === cleanPhone || (user.id && updated.id === user.id)) {
            // Realtime 24h WhatsApp Window timestamp update
            if (updated.last_whatsapp_inbound_at) {
              const parsed = new Date(updated.last_whatsapp_inbound_at).getTime();
              if (!isNaN(parsed) && parsed > 0) {
                setLastWhatsAppSync(parsed);
                SecureStore.setItemAsync('last-whatsapp-sync-timestamp', parsed.toString());
              }
            }
            if (updated.gemini_api_key !== undefined) {
              setGeminiApiKey(updated.gemini_api_key || '');
              if (updated.gemini_api_key) {
                SecureStore.setItemAsync('gemini-api-key', updated.gemini_api_key);
              }
            }
            setUser(prev => {
              if (!prev) return null;
              const nextName = updated.full_name || updated.name || prev.name;
              const nextCategory = updated.main_category || updated.category || prev.category;
              const nextUpi = updated.upi_id !== undefined ? updated.upi_id : prev.upiId;
              const nextAvatar = updated.avatar_url || prev.avatarUrl;
              const nextLocation = updated.location || prev.location;
              
              if (nextUpi) SecureStore.setItemAsync('user-upi-id', nextUpi);
              if (nextName) SecureStore.setItemAsync('user-name', nextName);
              if (nextCategory) SecureStore.setItemAsync('user-category', nextCategory);
              if (nextAvatar) SecureStore.setItemAsync('user-avatar-url', nextAvatar);
              if (nextLocation) SecureStore.setItemAsync('user-location', nextLocation);
              
              return {
                ...prev,
                name: nextName,
                category: nextCategory,
                upiId: nextUpi || '',
                avatarUrl: nextAvatar || '',
                location: nextLocation || '',
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.phone, user?.id]);

  const updateGeminiKey = useCallback(async (newKey: string) => {
    const key = (newKey || '').trim();
    setGeminiApiKey(key);
    if (key) {
      await SecureStore.setItemAsync('gemini-api-key', key);
    } else {
      await SecureStore.deleteItemAsync('gemini-api-key');
    }

    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
      try {
        await supabase
          .from('profiles')
          .update({ gemini_api_key: key })
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);

        fetch('https://watscrm.vercel.app/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, phone: user.phone, gemini_api_key: key }),
        }).catch(() => {});
      } catch (err) {
        console.warn('Sync gemini key to profile error:', err);
      }
    }
  }, [user?.phone, user?.id]);

  const updateUserProfile = useCallback(async (updates: Partial<AppUser>) => {
    let resolvedRole = updates.role;
    let categoryPinned: string[] | null = null;
    let categoryDefaultMod = updates.defaultModule;

    if (updates.category !== undefined) {
      const cat = (updates.category || '').toLowerCase();
      if (cat.includes('student') || cat.includes('learner') || cat.includes('candidate')) {
        resolvedRole = 'student';
        categoryDefaultMod = '/teacho';
        categoryPinned = ['teacho', 'testo'];
      } else if (cat.includes('teacher') || cat.includes('tutor')) {
        resolvedRole = 'teacher';
        categoryDefaultMod = '/teacho';
        categoryPinned = ['teacho', 'testo'];
      } else if (cat.includes('driver')) {
        resolvedRole = 'driver';
        categoryDefaultMod = '/drivo';
        categoryPinned = ['driveo', 'rideo'];
      } else if (cat.includes('farmer') || cat.includes('agri')) {
        resolvedRole = 'farmer';
        categoryDefaultMod = '/agro';
        categoryPinned = ['agro', 'rento'];
      } else if (cat.includes('partner')) {
        resolvedRole = 'partner';
        categoryDefaultMod = '/dealo';
        categoryPinned = ['dealo', 'rento'];
      } else if (cat.includes('shopper') || cat.includes('merchant')) {
        resolvedRole = 'shopper';
        categoryDefaultMod = '/dealo';
        categoryPinned = ['dealo', 'moneyo'];
      } else if (cat.includes('financier')) {
        resolvedRole = 'financier';
        categoryDefaultMod = '/moneyo';
        categoryPinned = ['moneyo', 'dealo'];
      } else if (cat.includes('tourist')) {
        resolvedRole = 'tourist';
        categoryDefaultMod = '/touro';
        categoryPinned = ['touro', 'rideo'];
      } else if (cat.includes('admin')) {
        resolvedRole = 'admin';
        categoryDefaultMod = '/admin';
        categoryPinned = ['wacrm', 'admin'];
      } else {
        resolvedRole = 'user';
        categoryDefaultMod = '/rideo';
        categoryPinned = ['rideo', 'touro'];
      }
    }

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
        ...(resolvedRole ? { role: resolvedRole } : {}),
        ...(categoryDefaultMod ? { defaultModule: categoryDefaultMod } : {}),
      };
    });

    if (categoryPinned) {
      setPinnedModules(categoryPinned);
      await SecureStore.setItemAsync('user-pinned-modules', JSON.stringify(categoryPinned));
    }

    if (categoryDefaultMod) {
      await SecureStore.setItemAsync('user-default-module', categoryDefaultMod);
    }

    if (resolvedRole) {
      await SecureStore.setItemAsync('user-role', resolvedRole);
    }

    if (updates.upiId !== undefined) {
      await SecureStore.setItemAsync('user-upi-id', updates.upiId || '');
    }
    if (updates.name !== undefined) {
      await SecureStore.setItemAsync('user-name', updates.name || '');
    }
    if (updates.category !== undefined) {
      await SecureStore.setItemAsync('user-category', updates.category || '');
    }
    if (updates.avatarUrl !== undefined) {
      await SecureStore.setItemAsync('user-avatar-url', updates.avatarUrl || '');
    }
    if (updates.location !== undefined) {
      await SecureStore.setItemAsync('user-location', updates.location || '');
    }

    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '').slice(-10);
      try {
        const dbPayload: any = {};
        if (updates.upiId !== undefined) dbPayload.upi_id = updates.upiId;
        if (updates.name !== undefined) dbPayload.full_name = updates.name;
        if (updates.category !== undefined) dbPayload.main_category = updates.category;
        if (resolvedRole !== undefined) dbPayload.role = resolvedRole;
        if (categoryDefaultMod !== undefined) dbPayload.default_module = categoryDefaultMod;
        if (updates.location !== undefined) dbPayload.location = updates.location;
        if (updates.avatarUrl !== undefined) dbPayload.avatar_url = updates.avatarUrl;

        await supabase
          .from('profiles')
          .update(dbPayload)
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);
      } catch (err) {
        console.warn('Background Supabase profile update error:', err);
      }
    }
  }, [user?.phone]);

  // ─── 23-Hour WhatsApp CRM Session & Notification Sync Methods ───

  const recordWhatsAppSync = useCallback(async (timestamp?: number) => {
    const ts = timestamp || Date.now();
    setLastWhatsAppSync(ts);
    await SecureStore.setItemAsync('last-whatsapp-sync-timestamp', ts.toString());
    try {
      const p = user?.phone;
      if (p) {
        const cleanPhone = p.replace(/\D/g, '').slice(-10);
        const isoTs = new Date(ts).toISOString();

        await supabase
          .from('profiles')
          .update({
            last_whatsapp_inbound_at: isoTs,
            updated_at: isoTs,
          })
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);

        await supabase
          .from('contacts')
          .update({
            updated_at: isoTs,
          })
          .ilike('phone', `%${cleanPhone}%`);

        // Also touch conversations so 24h window stays alive in CRM
        const { data: matchingContacts } = await supabase
          .from('contacts')
          .select('id')
          .ilike('phone', `%${cleanPhone}%`);
        if (matchingContacts && matchingContacts.length > 0) {
          await supabase
            .from('conversations')
            .update({ last_message_at: isoTs, updated_at: isoTs })
            .in('contact_id', matchingContacts.map((c: any) => c.id));
        }
      }
    } catch (e) {}
  }, [user?.phone]);

  const isWhatsAppSyncExpired = useCallback((thresholdHours: number = 23) => {
    if (!lastWhatsAppSync) return true;
    const elapsed = Date.now() - lastWhatsAppSync;
    return elapsed > thresholdHours * 60 * 60 * 1000;
  }, [lastWhatsAppSync]);

  const getWhatsAppWindowRemaining = useCallback(() => {
    if (!lastWhatsAppSync || lastWhatsAppSync <= 0) {
      return { isExpired: true, hours: 0, minutes: 0, formatted: 'Expired (Tap to Renew)', percentage: 0 };
    }
    const windowDurationMs = 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - lastWhatsAppSync;
    const remainingMs = windowDurationMs - elapsedMs;

    if (remainingMs <= 0) {
      return { isExpired: true, hours: 0, minutes: 0, formatted: 'Expired (Tap to Renew)', percentage: 0 };
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const percentage = Math.max(0, Math.min(100, Math.round((remainingMs / windowDurationMs) * 100)));

    return {
      isExpired: false,
      hours,
      minutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`,
      percentage,
    };
  }, [lastWhatsAppSync]);

  const renewWhatsAppWindow = useCallback(async (customMsg?: string) => {
    const waba = '916381029380';
    const locSnippet = user?.location ? ` (Location: ${user.location})` : '';
    const msg = customMsg || `Hi SuprO, keep my 24h WhatsApp notification window active 🔔${locSnippet}`;
    const url = `whatsapp://send?phone=${waba}&text=${encodeURIComponent(msg)}`;
    const fallbackUrl = `https://wa.me/${waba}?text=${encodeURIComponent(msg)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(fallbackUrl);
      }
      await recordWhatsAppSync();
    } catch (e) {
      await Linking.openURL(fallbackUrl);
      await recordWhatsAppSync();
    }
  }, [recordWhatsAppSync, user?.location]);

  return (
    <AppContext.Provider value={{
      user,
      userRole,
      isAdmin,
      isLoading,
      signIn,
      signOut,
      updateUserProfile,
      recentModules,
      addRecentModule,
      geminiApiKey,
      updateGeminiKey,
      setGeminiApiKey: updateGeminiKey,
      onboardingComplete,
      setSelectedModule,
      pinnedModules,
      togglePinnedModule,
      themeMode,
      themeAccent,
      themeVer,
      setThemeMode,
      setThemeAccent,
      // 23h WhatsApp CRM Window Sync
      lastWhatsAppSync,
      recordWhatsAppSync,
      isWhatsAppSyncExpired,
      getWhatsAppWindowRemaining,
      renewWhatsAppWindow,
      // Legacy compat
      setUserRole: (role: string) => setUser(prev => prev ? { ...prev, role } : null),
    }}>
      {children}
    </AppContext.Provider>
  );
};

