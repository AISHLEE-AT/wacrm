import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// Admin phone numbers (same as web app)
const ADMIN_PHONES = ['6381029380', '9876543210'];

export interface AppUser {
  phone: string;
  name: string;
  role: string;       // e.g. 'admin' | 'user' | 'driver' | 'Teacher' etc.
  category: string;   // e.g. 'Admin' | 'Traveller' | 'Driver' etc.
  isAdmin: boolean;
  accessToken: string | null;
  refreshToken?: string | null;
}

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [recentModules, setRecentModules] = useState<string[]>(['Map']);
  const [user, setUser] = useState<AppUser | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Derived shorthand for components still using userRole
  const userRole = user?.isAdmin ? 'admin' : (user?.role ?? 'user');
  const isAdmin = user?.isAdmin ?? false;

  useEffect(() => {
    const loadState = async () => {
      try {
        // Load all persisted user state
        const savedModules = await SecureStore.getItemAsync('recent-modules');
        if (savedModules) setRecentModules(JSON.parse(savedModules));

        const phone = await SecureStore.getItemAsync('user-phone');
        const name = await SecureStore.getItemAsync('user-name');
        const role = await SecureStore.getItemAsync('user-role');
        const category = await SecureStore.getItemAsync('user-category');
        const accessToken = await SecureStore.getItemAsync('sb-access-token');
        const refreshToken = await SecureStore.getItemAsync('sb-refresh-token');
        const apiKey = await SecureStore.getItemAsync('gemini-api-key');

        if (phone) {
          const adminStatus = ADMIN_PHONES.includes(phone);
          setUser({
            phone,
            name: name ?? '',
            role: role ?? 'user',
            category: category ?? 'Traveller',
            isAdmin: adminStatus || role === 'admin' || category === 'Admin',
            accessToken,
            refreshToken,
          });
        }
        if (apiKey) setGeminiApiKey(apiKey);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const signIn = useCallback(async (userData: Partial<AppUser>) => {
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
    };

    setUser(fullUser);

    // Persist
    await SecureStore.setItemAsync('user-phone', phone);
    await SecureStore.setItemAsync('user-name', fullUser.name);
    await SecureStore.setItemAsync('user-role', fullUser.role);
    await SecureStore.setItemAsync('user-category', fullUser.category);
    if (fullUser.accessToken) {
      await SecureStore.setItemAsync('sb-access-token', fullUser.accessToken);
    }
    if (fullUser.refreshToken) {
      await SecureStore.setItemAsync('sb-refresh-token', fullUser.refreshToken);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('sb-refresh-token');
    await SecureStore.deleteItemAsync('user-phone');
    await SecureStore.deleteItemAsync('user-name');
    await SecureStore.deleteItemAsync('user-role');
    await SecureStore.deleteItemAsync('user-category');
    await SecureStore.deleteItemAsync('gemini-api-key');
  }, []);

  const addRecentModule = useCallback(async (moduleName: string) => {
    let updated = [moduleName, ...recentModules.filter(m => m !== moduleName)];
    if (updated.length > 3) updated = updated.slice(0, 3);
    setRecentModules(updated);
    await SecureStore.setItemAsync('recent-modules', JSON.stringify(updated));
  }, [recentModules]);

  const updateGeminiKey = useCallback(async (key: string) => {
    setGeminiApiKey(key);
    await SecureStore.setItemAsync('gemini-api-key', key);
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      userRole,
      isAdmin,
      isLoading,
      signIn,
      signOut,
      recentModules,
      addRecentModule,
      geminiApiKey,
      updateGeminiKey,
      // Legacy compat
      setUserRole: (role: string) => setUser(prev => prev ? { ...prev, role } : null),
    }}>
      {children}
    </AppContext.Provider>
  );
};
