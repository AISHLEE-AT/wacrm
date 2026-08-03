import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [recentModules, setRecentModules] = useState<string[]>(['Map']); // Default to RideO (Map)
  const [userRole, setUserRole] = useState<string>('user');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  useEffect(() => {
    const loadState = async () => {
      const savedModules = await SecureStore.getItemAsync('recent-modules');
      if (savedModules) setRecentModules(JSON.parse(savedModules));

      const role = await SecureStore.getItemAsync('user-role');
      if (role) setUserRole(role);

      const apiKey = await SecureStore.getItemAsync('gemini-api-key');
      if (apiKey) setGeminiApiKey(apiKey);
    };
    loadState();
  }, []);

  const addRecentModule = async (moduleName: string) => {
    let updated = [moduleName, ...recentModules.filter(m => m !== moduleName)];
    if (updated.length > 2) {
      updated = updated.slice(0, 2);
    }
    setRecentModules(updated);
    await SecureStore.setItemAsync('recent-modules', JSON.stringify(updated));
  };

  const updateGeminiKey = async (key: string) => {
    setGeminiApiKey(key);
    await SecureStore.setItemAsync('gemini-api-key', key);
  };

  return (
    <AppContext.Provider value={{
      recentModules,
      addRecentModule,
      userRole,
      setUserRole,
      geminiApiKey,
      updateGeminiKey
    }}>
      {children}
    </AppContext.Provider>
  );
};
