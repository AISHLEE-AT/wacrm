const API_URL = 'https://watscrm.vercel.app';
const endpoints = {
  authCheck: `${API_URL}/api/auth/check`,
  authVerify: `${API_URL}/api/auth/otp/verify`,
  authPinSet: `${API_URL}/api/auth/pin/set`,
  authPinLogin: `${API_URL}/api/auth/pin`,
  authWaba: `${API_URL}/api/auth/otp/waba`,
  updateProfile: `${API_URL}/api/profile/update`,
};

export const API = {
  checkUser: async (phone: string) => {
    // 1. Check vercel API
    const res = await fetch(`${endpoints.authCheck}?phone=${phone}`);
    const data = await res.json();
    
    // 2. Fetch API key directly from Supabase to bypass outdated Vercel endpoints
    try {
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE";
      const spRes = await fetch(`https://gmahjdzqitbomtmdzlfp.supabase.co/rest/v1/profiles?phone=eq.${phone}&select=gemini_api_key`, {
        headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` }
      });
      const spData = await spRes.json();
      if (spData && spData.length > 0 && spData[0].gemini_api_key) {
        data.gemini_api_key = spData[0].gemini_api_key;
      }
    } catch (e) {}
    
    return data;
  },
  
  verifyOtp: async (phone: string, otp: string, fullName?: string, category?: string) => {
    const payload: any = { phone, otp };
    if (fullName) payload.fullName = fullName;
    if (category) payload.category = category;

    const res = await fetch(endpoints.authVerify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  },
  
  getWabaPhone: async () => {
    try {
      const res = await fetch(endpoints.authWaba);
      const data = await res.json();
      return data.phone || "916381029380"; // Fallback just in case
    } catch (e) {
      return "916381029380";
    }
  },

  setPin: async (phone: string, pin: string, confirmPin: string) => {
    const res = await fetch(endpoints.authPinSet, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin, confirmPin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save PIN');
    return data;
  },

  loginWithPin: async (phone: string, pin: string) => {
    const res = await fetch(endpoints.authPinLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  }
};
